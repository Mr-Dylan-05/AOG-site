<?php
/**
 * @package  AOGCountryFlagPlugin
 */
/*
Plugin Name: AOG Ninja Forms Country Flag Plugin
Description: Adds a country flag dropdown selector to a Ninja Forms phone number field. To use, add the class "aog-phone" to the input field.
Version: 1.0.2
Author: AOG Group
Author URI: http://adongroup.com.au/
Text Domain: aog-country-flag-plugin
*/

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

require 'plugin-update-checker/plugin-update-checker.php';
$MyUpdateChecker = PucFactory::buildUpdateChecker(
    'https://repo.adondevelopment.com/aog-country-flag-plugin/info.json',
    __FILE__
);

if ( !class_exists( 'countryFlag' ) ) {

class AOGCountryFlagPlugin{

    function register(){
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue' ) );
        add_action( 'wp_footer', array( $this, 'my_footer_scripts' ) );
    }

    function activate(){
        flush_rewrite_rules();
    }
    function deactivate(){
        flush_rewrite_rules();
    }
   function enqueue() {
		// enqueue all our scripts
        ?> 
            <script type="text/javascript">
               const div = document.querySelector('input[type="tel"]');
            if(div !== null){
               setTimeout(function(){
                    if(div.classList.contains('aog-phone')){
        
        <?php
                    wp_enqueue_style( 'intlTelInput-css', plugins_url( '/build/css/intlTelInput.css', __FILE__ ) );
                    wp_enqueue_script( 'intlTelInput-js', plugins_url( '/build/js/intlTelInput.js', __FILE__ ) );
                    wp_enqueue_script( 'myscript-js', plugins_url( '/assets/js/myscript.js', __FILE__ ) );
                    wp_enqueue_script( 'intlTelInput-utils', plugins_url( '/build/js/utils.js', __FILE__ ) );

        ?> 
                    }
                }, 500);
            }
            </script>
        <?php
	}
    function my_footer_scripts(){

        $plugin_dir = 'intlTelInput-utils';

        ?>
        <script>
            setTimeout(function(){
                if(jQuery(".aog-phone").length > 0){
                    jQuery('.aog-phone').each(function(){
                         window.intlTelInput(this, {
                            utilsScript: '<?php echo 'intlTelInput-utils' ?>',
                            initialCountry: "au",   
                            separateDialCode: true,
                        });
                    })  
                }
            }, 1000);
            
        
        </script>
        <?php
    }

}


$countryFlag = new AOGCountryFlagPlugin();
$countryFlag->register();
//activate

register_activation_hook( __FILE__, array( $countryFlag, 'activate' ) );

// deactivation
register_deactivation_hook( __FILE__, array( $countryFlag, 'deactivate' ) );
}