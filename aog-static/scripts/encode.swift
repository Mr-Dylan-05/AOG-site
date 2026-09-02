import AVFoundation
import Foundation
import CoreImage

// transcode.swift — 1080p source to a web-sized 720p H.264, plus a poster frame.
// avconvert only offers quality presets and produced a file larger than the
// source, so this drives AVAssetReader/Writer to hit an explicit bitrate.

let args = CommandLine.arguments
guard args.count >= 4 else { print("usage: encode <in> <out> <bitrate> [poster]"); exit(1) }
let inURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])
let videoBitrate = Int(args[3]) ?? 1_200_000
let posterPath: String? = args.count > 4 ? args[4] : nil

let asset = AVAsset(url: inURL)
guard let srcVideo = asset.tracks(withMediaType: .video).first else { print("no video track"); exit(1) }
let srcAudio = asset.tracks(withMediaType: .audio).first

// Fit inside 1280x720, keeping the source aspect ratio, on even pixel bounds.
let natural = srcVideo.naturalSize.applying(srcVideo.preferredTransform)
let sw = abs(natural.width), sh = abs(natural.height)
let scale = min(1280.0 / sw, 720.0 / sh, 1.0)
let outW = (Int(sw * scale) / 2) * 2, outH = (Int(sh * scale) / 2) * 2

try? FileManager.default.removeItem(at: outURL)
let reader = try AVAssetReader(asset: asset)
let writer = try AVAssetWriter(outputURL: outURL, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true          // faststart: moov before mdat

// Scale during the read.
//
// AVMutableVideoComposition(propertiesOf:) copies the asset's own instructions,
// which place the source at 1:1. Shrinking renderSize under that does NOT
// resize the picture — it renders the full-size frame into a smaller canvas and
// crops whatever falls outside. The layer needs an explicit scale transform.
let comp = AVMutableVideoComposition()
comp.renderSize = CGSize(width: outW, height: outH)
let fps = srcVideo.nominalFrameRate > 0 ? srcVideo.nominalFrameRate : 30
comp.frameDuration = CMTime(value: 1, timescale: CMTimeScale(round(fps)))
let instruction = AVMutableVideoCompositionInstruction()
instruction.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: srcVideo)
layer.setTransform(srcVideo.preferredTransform
                     .concatenating(CGAffineTransform(scaleX: scale, y: scale)), at: .zero)
instruction.layerInstructions = [layer]
comp.instructions = [instruction]
let vOut = AVAssetReaderVideoCompositionOutput(
  videoTracks: [srcVideo],
  videoSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange])
vOut.videoComposition = comp
vOut.alwaysCopiesSampleData = false
reader.add(vOut)

let vIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: outW,
  AVVideoHeightKey: outH,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: videoBitrate,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoMaxKeyFrameIntervalKey: 60,          // a keyframe every ~2s, so seeking stays responsive
    AVVideoAllowFrameReorderingKey: true,
  ],
])
vIn.expectsMediaDataInRealTime = false
writer.add(vIn)

var aOut: AVAssetReaderTrackOutput?
var aIn: AVAssetWriterInput?
if let track = srcAudio {
  let o = AVAssetReaderTrackOutput(track: track,
    outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM,
                     AVLinearPCMBitDepthKey: 16, AVLinearPCMIsFloatKey: false,
                     AVLinearPCMIsBigEndianKey: false, AVLinearPCMIsNonInterleaved: false])
  reader.add(o); aOut = o
  let i = AVAssetWriterInput(mediaType: .audio, outputSettings: [
    AVFormatIDKey: kAudioFormatMPEG4AAC,
    AVSampleRateKey: 44100,
    AVNumberOfChannelsKey: 2,
    AVEncoderBitRateKey: 96_000,                // speech; 253k in the source is far more than it needs
  ])
  i.expectsMediaDataInRealTime = false
  writer.add(i); aIn = i
}

reader.startReading()
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let group = DispatchGroup()
func pump(_ input: AVAssetWriterInput, _ output: AVAssetReaderOutput, _ label: String) {
  group.enter()
  input.requestMediaDataWhenReady(on: DispatchQueue(label: label)) {
    while input.isReadyForMoreMediaData {
      if let buf = output.copyNextSampleBuffer() { input.append(buf) }
      else { input.markAsFinished(); group.leave(); return }
    }
  }
}
pump(vIn, vOut, "video")
if let i = aIn, let o = aOut { pump(i, o, "audio") }

group.wait()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()

if writer.status != .completed {
  print("failed: \(writer.error?.localizedDescription ?? "unknown")"); exit(1)
}

// Poster: the very first frame, so there is no jump when playback starts.
if let path = posterPath {
  let gen = AVAssetImageGenerator(asset: asset)
  gen.appliesPreferredTrackTransform = true
  gen.requestedTimeToleranceBefore = .zero
  gen.requestedTimeToleranceAfter = .zero
  gen.maximumSize = CGSize(width: outW, height: outH)
  if let cg = try? gen.copyCGImage(at: .zero, actualTime: nil) {
    let ci = CIImage(cgImage: cg)
    let ctx = CIContext()
    if let data = ctx.jpegRepresentation(of: ci, colorSpace: CGColorSpaceCreateDeviceRGB(),
                                         options: [kCGImageDestinationLossyCompressionQuality as CIImageRepresentationOption: 0.72]) {
      try? data.write(to: URL(fileURLWithPath: path))
      print("poster \(outW)x\(outH)")
    }
  }
}
print("ok \(outW)x\(outH)")
