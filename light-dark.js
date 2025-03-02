// Author: Aymen Nasri
// Version: <1.2.0>
// Description: Change plots theme depending on body class (quarto-light or quarto-dark)
// Originally made by Mickaël Canouil
// License: MIT

function updateImageSrc() {
  // Identifying which theme is on
  const isLightMode = document.body.classList.contains("quarto-light");
  const isDarkMode = document.body.classList.contains("quarto-dark");

  if (!isLightMode && !isDarkMode) return; // Exit if neither mode is active

  // Function to update styles
  const updateElements = (selector, updateFunc) => {
    document.querySelectorAll(selector).forEach(updateFunc);
  };

  // Function to replace the plots depending on theme
  updateElements("img", (img) => {
    const newSrc = img.src.replace(
      isLightMode ? ".dark" : ".light",
      isDarkMode ? ".dark" : ".light",
    );
    if (newSrc !== img.src) img.src = newSrc;
  });

  // Update ggplot
  const updateStyle = (elem, prop, lightValue, darkValue) => {
    const currentValue = elem.style[prop];
    const newValue = isDarkMode ? darkValue : lightValue;
    if (currentValue !== newValue) elem.style[prop] = newValue;
  };

  // Update ploly background color for both the plot and the legend box
  updateElements('svg[style*="background"]', (svg) =>
    updateStyle(svg, "background", "rgb(255, 241, 229)", "rgb(34, 34, 34)"),
  );
  updateElements('rect[style*="fill"]', (rect) =>
    updateStyle(rect, "fill", "rgb(255, 241, 229)", "rgb(34, 34, 34)"),
  );

  // Save the original plotly styling
  updateElements('text[class*="legendtext"], svg text, svg tspan', (text) => {

    if (!text.dataset.originalStyle) {
      const computedStyle = window.getComputedStyle(text);
      text.dataset.originalStyle = JSON.stringify({
        fill: computedStyle.fill,
        color: computedStyle.color,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        fontFamily: computedStyle.fontFamily,
        textDecoration: computedStyle.textDecoration,
      });
    }

    const originalStyle = JSON.parse(text.dataset.originalStyle);

    // Modify the text colors for plotly labels
    if (isDarkMode) {
      text.style.fill = "white";
      text.style.color = "rgb(204,193,183)";
    } else {
      Object.assign(text.style, originalStyle);
    }
  });

  // Update table text color
  updateElements(
    ".gt_table_body, .gt_heading, .gt_sourcenotes, .gt_footnotes",
    (table) => {
      if (isDarkMode) {
        table.style.color = "white"; // Set text color to a light shade
      } else {
        table.style.color = ""; // Reset to default
      }
    },
  );

  updateElements(".reactable", (table) => {
    // Update text colors in reactable table
    updateElements(
      ".rt-tbody .rt-tr, .rt-thead .rt-tr, .rt-pagination",
      (elem) => {
        updateStyle(elem, "color", "", isDarkMode ? "white" : "");
      },
    );

    // Update background color for the search input
    updateElements(".rt-search", (input) => {
      if (isDarkMode) {
        input.style.backgroundColor = "rgb(50, 50, 50)";
        input.style.color = "white";
        input.style.borderColor = "rgba(255, 255, 255, 0.2)";
      } else {
        input.style.backgroundColor = "";
        input.style.color = "";
        input.style.borderColor = "";
      }
    });
    
    // Update all pagination buttons for hover/active states
    updateElements(".rt-pagination button", (button) => {
      if (isDarkMode) {
        // Store original background to reset to
        const originalBg = "";
        
        // Add hover effect via CSS
        button.style.transition = "background-color 0.2s";
        
        // Function to reset backgrounds on all pagination buttons
        const resetAllButtons = () => {
          document.querySelectorAll('.rt-pagination button').forEach(btn => {
            if (!btn.classList.contains('rt-page-button-current')) {
              btn.style.backgroundColor = originalBg;
            }
          });
        };
        
        // Add click handler to reset all buttons first
        button.addEventListener('click', () => {
          // Small timeout to let reactable update the current button class
          setTimeout(resetAllButtons, 50);
        });
        
        // Hover effects
        button.addEventListener('mouseenter', () => {
          if (!button.classList.contains('rt-page-button-current')) {
            button.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }
        });
        
        button.addEventListener('mouseleave', () => {
          if (!button.classList.contains('rt-page-button-current')) {
            button.style.backgroundColor = originalBg;
          }
        });
      }
    });
    
    // Update all pagination buttons for hover/active states
    updateElements(".rt-pagination button", (button) => {
      if (isDarkMode) {
        // Add hover effect via CSS
        button.style.transition = "background-color 0.2s";
        
        // Add event listeners for hover/click states
        button.addEventListener('mouseenter', () => {
          if (!button.classList.contains('rt-page-button-current')) {
            button.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }
        });
        
        button.addEventListener('mouseleave', () => {
          if (!button.classList.contains('rt-page-button-current')) {
            button.style.backgroundColor = "";
          }
        });
        
        // Style for active (clicked) state
        button.addEventListener('mousedown', () => {
          button.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        });
        
        button.addEventListener('mouseup', () => {
          if (!button.classList.contains('rt-page-button-current')) {
            button.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }
        });
      } else {
        // Remove event listeners in light mode
        button.style.transition = "";
      }
    });
      
    // Update pagination buttons
    updateElements(".rt-pagination-nav button", (button) => {
      if (isDarkMode) {
        button.style.color = "rgba(255, 255, 255, 0.7)";
      } else {
        button.style.color = "";
      }
    });

    // For current page button
    updateElements(".rt-page-button-current", (button) => {
      if (isDarkMode) {
        button.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        button.style.color = "white";
      } else {
        button.style.backgroundColor = "";
        button.style.color = "";
      }
    });

    // Header sort indicators should be visible in dark mode
    updateElements(".rt-sort-header", (header) => {
      if (isDarkMode) {
        header.style.color = "white";
      } else {
        header.style.color = "";
      }
    });
  });
}

// Observer making sure all changes are done
const observer = new MutationObserver((mutations) => {
  if (
    mutations.some(
      (mutation) =>
        (mutation.type === "attributes" &&
          mutation.attributeName === "class") ||
        (mutation.type === "childList" && mutation.target.tagName === "svg"),
    )
  ) {
    updateImageSrc();
  }
});

observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
  attributeFilter: ["class"],
});

// Run on page load and immediately
document.addEventListener("DOMContentLoaded", updateImageSrc);
updateImageSrc();
