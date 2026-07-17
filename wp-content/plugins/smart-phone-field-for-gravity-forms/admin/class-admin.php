<?php
if (!defined('ABSPATH')) {
    exit;
}

class SPF_Admin_Menu {
    public function __construct() {
        add_filter('admin_footer_text', [$this, 'admin_footer'], 1, 2);
        add_action('admin_menu', [$this, 'add_menu']);
        add_action('admin_enqueue_scripts', [$this, 'admin_scripts']);

        add_action('admin_notices', [$this, 'review_request']);
        add_action('admin_notices', [$this, 'offer_notice']);
        add_action('wp_ajax_plc_review_dismiss', [$this, 'review_dismiss']);
        add_action('wp_ajax_pcafe_offer_notice_dismiss', [$this, 'pcafe_offer_notice_dismiss']);
    }

    public function admin_scripts() {
        $current_screen = get_current_screen();
        if (strpos($current_screen->base, 'smart-phone-field-for-gravity-forms') === false) {
            return;
        }

        wp_enqueue_style('spf_admin_menu', GF_SMART_PHONE_FIELD_URL . 'assets/css/spf_admin.css', array(), GF_SMART_PHONE_FIELD_VERSION_NUM);
        wp_enqueue_script('spf_admin_menu', GF_SMART_PHONE_FIELD_URL . 'assets/js/spf_admin_script.js', array('jquery'), GF_SMART_PHONE_FIELD_VERSION_NUM, true);
    }

    public function add_menu() {
        add_submenu_page(
            'options-general.php',
            'Smart Phone Field Gravity Forms',
            'Smart Phone Field',
            'administrator',
            'smart-phone-field-for-gravity-forms-pro',
            [$this, 'spf_admin_page']
        );
    }

    public function spf_admin_page() {
        echo '<div class="pcafe_spf_dashboard">';
        include_once __DIR__ . '/template/header.php';

        echo '<div id="pcafe_tab_box" class="pcafe_container">';
        include_once __DIR__ . '/template/introduction.php';
        include_once __DIR__ . '/template/usage.php';
        include_once __DIR__ . '/template/help.php';
        include_once __DIR__ . '/template/pro.php';
        include_once __DIR__ . '/template/other-plugins.php';
        echo '</div>';
        echo '</div>';
    }

    public function admin_footer($text) {
        global $current_screen;

        if (! empty($current_screen->id) && strpos($current_screen->id, 'smart-phone-field-for-gravity-forms') !== false) {
            $url  = 'https://wordpress.org/support/plugin/smart-phone-field-for-gravity-forms/reviews/#new-post';
            $text = sprintf(
                wp_kses(
                    /* translators: $1$s - WPForms plugin name; $2$s - WP.org review link; $3$s - WP.org review link. */
                    __('Thank you for using %1$s. Please rate us <a href="%2$s" target="_blank" rel="noopener noreferrer">&#9733;&#9733;&#9733;&#9733;&#9733;</a> on <a href="%3$s" target="_blank" rel="noopener">WordPress.org</a> to boost our motivation.', 'smart-phone-field-for-gravity-forms'),
                    array(
                        'a' => array(
                            'href'   => array(),
                            'target' => array(),
                            'rel'    => array(),
                        ),
                    )
                ),
                '<strong>Smart Phone Field For Gravity Forms</strong>',
                $url,
                $url
            );
        }

        return $text;
    }

    public function review_request() {
        if (! is_super_admin()) {
            return;
        }

        $time = time();
        $load = false;

        $review = get_option('pcafe_spf_review_status');

        if (! $review) {
            $review_time = strtotime("+15 days", time());
            update_option('pcafe_spf_review_status', $review_time);
        } else {
            if (! empty($review) && $time > $review) {
                $load = true;
            }
        }
        if (! $load) {
            return;
        }

        $this->review();
    }

    public function review() {
        $current_user = wp_get_current_user();
        $nonce = wp_create_nonce('smart_phone_field_review_dismiss_nonce');
?>
        <div class="notice notice-info is-dismissible pcafe_gfspf_review_notice" data-nonce="<?php echo esc_attr($nonce); ?>">
            <p>
                <?php
                echo sprintf(
                    /* translators: 1: User display name, 2: Plugin name */
                    esc_html__(
                        'Hey %1$s 👋, I noticed you are using %2$s for a few days — that\'s Awesome! If you feel %2$s is helping your business to grow in any way, could you please do us a BIG favor and give it a 5-star rating on WordPress to boost our motivation?',
                        'smart-phone-field-for-gravity-forms'
                    ),
                    esc_html($current_user->display_name),
                    '<strong>Smart Phone Field For Gravity Forms</strong>'
                );
                ?>
            </p>

            <ul style="margin-bottom: 5px">
                <li style="display: inline-block">
                    <a style="padding: 5px 5px 5px 0; text-decoration: none;" target="_blank" href="<?php echo esc_url('https://wordpress.org/support/plugin/smart-phone-field-for-gravity-forms/reviews/#new-post') ?>">
                        <span class="dashicons dashicons-external"></span><?php esc_html_e(' Ok, you deserve it!', 'smart-phone-field-for-gravity-forms') ?>
                    </a>
                </li>
                <li style="display: inline-block">
                    <a style="padding: 5px; text-decoration: none;" href="#" class="already_done" data-status="already">
                        <span class="dashicons dashicons-smiley"></span>
                        <?php esc_html_e('I already did', 'smart-phone-field-for-gravity-forms') ?>
                    </a>
                </li>
                <li style="display: inline-block">
                    <a style="padding: 5px; text-decoration: none;" href="#" class="later" data-status="later">
                        <span class="dashicons dashicons-calendar-alt"></span>
                        <?php esc_html_e('Maybe Later', 'smart-phone-field-for-gravity-forms') ?>
                    </a>
                </li>
                <li style="display: inline-block">
                    <a style="padding: 5px; text-decoration: none;" target="_blank" href="<?php echo esc_url('https://pluginscafe.com/support/') ?>">
                        <span class="dashicons dashicons-sos"></span>
                        <?php esc_html_e('I need help', 'smart-phone-field-for-gravity-forms') ?>
                    </a>
                </li>
                <li style="display: inline-block">
                    <a style="padding: 5px; text-decoration: none;" href="#" class="never" data-status="never">
                        <span class="dashicons dashicons-dismiss"></span>
                        <?php esc_html_e('Never show again', 'smart-phone-field-for-gravity-forms') ?>
                    </a>
                </li>
            </ul>
        </div>
        <script>
            jQuery(document).ready(function($) {
                $(document).on('click', '.already_done, .later, .never, .notice-dismiss', function(event) {
                    event.preventDefault();

                    var $this = $(this);
                    var status = $this.attr('data-status');
                    var nonce = '';

                    if (status == 'already' || status == 'later' || status == 'never') {
                        nonce = $this.parent().parent().parent().attr('data-nonce');
                    }

                    var data = {
                        action: 'plc_review_dismiss',
                        status: status,
                        nonce: nonce
                    };

                    console.log(data);
                    $.ajax({
                        url: '<?php echo esc_url(admin_url("admin-ajax.php")); ?>',
                        type: 'POST',
                        data: data,
                        success: function(data) {
                            console.log(data);
                            $('.pcafe_gfspf_review_notice').remove();
                        },
                        error: function(data) {}
                    });
                });
            });
        </script>
        <?php
    }

    public function review_dismiss() {
        check_ajax_referer('smart_phone_field_review_dismiss_nonce', 'nonce');

        $status = '';
        if (isset($_POST['status'])) {
            $status = sanitize_text_field(wp_unslash($_POST['status']));
        }

        if ($status == 'already' || $status == 'never') {
            $next_try     = strtotime("+30 days", time());
            update_option('pcafe_spf_review_status', $next_try);
        } else if ($status == 'later') {
            $next_try     = strtotime("+10 days", time());
            update_option('pcafe_spf_review_status', $next_try);
        }
        wp_die();
    }

    public function offer_notice() {
        $nonce = wp_create_nonce('pcafe_spf_offer_dismiss_nonce');
        $ajax_url = admin_url('admin-ajax.php');

        $transient_key = 'spf_offer_notice';
        $notice_array = get_transient($transient_key);
        $is_offer_checked = get_transient('pcafe_spf_offer_arrived_notice');

        $allowed_tags = [
            'strong' => [],
            'code' => [],
            'a'      => [
                'href'   => [],
                'title'  => [],
                'target' => [],
                'rel'    => [],
            ],
            'span'   => ['style' => []],
        ];


        if ($notice_array === false) {
            // Fetch from remote only if cache expired
            $endpoint  = 'https://api.pluginscafe.com/wp-json/pcafe/v1/offers?id=1';
            $response  = wp_remote_get($endpoint, array('timeout' => 10));

            if (!is_wp_error($response) && $response['response']['code'] === 200) {
                $notice_array = json_decode($response['body'], true);

                // Save in cache for 3 hours (change as needed)
                set_transient($transient_key, $notice_array, 3 * HOUR_IN_SECONDS);
            }
        }

        if (!empty($notice_array) && isset($notice_array['notice']) && $notice_array['live'] === true && $is_offer_checked === false) {
            $notice_type = $notice_array['notice']['notice_type'] ? $notice_array['notice']['notice_type'] : 'info';
            $notice_class = "notice-{$notice_type}";
        ?>
            <div class="notice <?php echo esc_attr($notice_class); ?> is-dismissible pcafe_spf_offer_notice" data-ajax-url="<?php echo esc_url($ajax_url); ?>"
                data-nonce="<?php echo esc_attr($nonce); ?>">
                <div class="pcafe_notice_container" style="display: flex;align-items:center;padding:10px 0;justify-content:space-between;gap:15px;">
                    <div class="pcafe_spf_notice_content" style="display: flex;align-items:center;gap:15px;">
                        <?php if ($notice_array['notice']['image']) : ?>
                            <div class="pcafe_notice_img">
                                <img width="90px" src="<?php echo esc_url($notice_array['notice']['image']); ?>" />
                            </div>
                        <?php endif; ?>
                        <div class="pcafe_notice_text">
                            <h3 style="margin:0 0 6px;"><?php echo esc_html($notice_array['notice']['title']); ?></h3>
                            <p><?php echo wp_kses($notice_array['notice']['content'], $allowed_tags); ?></p>
                            <div class="pcafe_notice_buttons" style="display: flex; gap:15px;align-items:center;">
                                <?php if ($notice_array['notice']['show_demo_url'] === true) : ?>
                                    <a href="https://demo.pluginscafe.com/smart-phone-field-for-gravity-forms/" class="button-primary" target="__blank"><?php esc_html_e('Check Demo', 'smart-phone-field-for-gravity-forms'); ?></a>
                                <?php endif; ?>
                                <a href="#" class="dismis_api__notice">
                                    <?php esc_html_e('Dismiss', 'smart-phone-field-for-gravity-forms'); ?>
                                </a>
                            </div>
                        </div>
                    </div>
                    <?php if ($notice_array['notice']['upgrade_btn'] === true) : ?>
                        <div class="pcafe_spf_upgrade_btn">
                            <a href="<?php echo esc_url(spffgfp_fs()->get_upgrade_url()); ?>" style="text-decoration: none;font-size: 15px;background: #7BBD02;color: #fff;display: inline-block;padding: 10px 20px;border-radius: 3px;">
                                <?php echo esc_html($notice_array['notice']['upgrade_btn_text']); ?>
                            </a>
                        </div>
                    <?php endif; ?>
                </div>
                <style>

                </style>
            </div>

            <script>
                jQuery(document).ready(function($) {
                    $(document).on('click', '.dismis_api__notice, .pcafe_spf_offer_notice .notice-dismiss', function(event) {
                        event.preventDefault();
                        const $notice = jQuery(this).closest('.pcafe_spf_offer_notice');
                        const ajaxUrl = $notice.data('ajax-url');
                        const nonce = $notice.data('nonce');

                        $.ajax({
                            url: ajaxUrl,
                            type: 'post',
                            data: {
                                action: 'pcafe_offer_notice_dismiss',
                                nonce: nonce
                            },
                            success: function(response) {
                                $('.pcafe_spf_offer_notice').remove();
                            },
                            error: function(data) {}
                        });
                    });
                });
            </script>
<?php

        }
    }

    public function pcafe_offer_notice_dismiss() {
        check_ajax_referer('pcafe_spf_offer_dismiss_nonce', 'nonce');
        set_transient('pcafe_spf_offer_arrived_notice', true, 2 * DAY_IN_SECONDS);
        wp_send_json_success();
    }
}


new SPF_Admin_Menu();
