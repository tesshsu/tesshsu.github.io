import React, { useEffect } from "react";

const BookingWidget = () => {
  useEffect(() => {
    // Check if the script is already loaded to avoid duplicates
    if (document.querySelector('script[src="https://widget.simplybook.me/v2/widget/widget.js"]')) {
      initializeWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://widget.simplybook.me/v2/widget/widget.js";
    script.async = true;

    script.onload = () => {
      initializeWidget();
    };

    script.onerror = () => {
      console.error("Failed to load SimplyBook.me widget script");
    };

    document.body.appendChild(script);

    // Cleanup: Remove the script when the component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://widget.simplybook.me/v2/widget/widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const initializeWidget = () => {
    if (window.SimplybookWidget) {
      new window.SimplybookWidget({
        widget_type: "popup",
        url: "https://vachatech.simplybook.it",
        theme: "simple",
        theme_settings: {
          timeline_hide_unavailable: "1",
          hide_past_days: "1",
          sb_base_color: "#ff6600",
          sb_primary_color: "#ffffff",
          sb_text_color: "#333333",
        },
        app_config: {
          clear_session: 1,
        },
        popup_width: "600px",
        popup_height: "700px",
        button_target_id: "booking-popup-btn",
      });
    } else {
      console.error("SimplyBookWidget is not available. Script may have failed to load.");
    }
  };

  return null; // No need to render anything
};

export default BookingWidget;