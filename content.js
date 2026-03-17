// Helper function to safely execute ASP.NET postback
function executePostback(eventTarget, eventArgument = '', validate = true, validationGroup = 'Survey') {
  const form = document.getElementById('form1');
  if (!form) {
    console.error('Form not found');
    return false;
  }

  // Set the event target and argument
  const eventTargetField = document.getElementById('__EVENTTARGET');
  const eventArgumentField = document.getElementById('__EVENTARGUMENT');
  
  if (eventTargetField) eventTargetField.value = eventTarget;
  if (eventArgumentField) eventArgumentField.value = eventArgument;

  // Try ASP.NET WebForms validation if needed
  if (validate && typeof ValidatorOnSubmit === 'function') {
    if (!ValidatorOnSubmit()) {
      console.log('Validation failed');
      return false;
    }
  }

  // Submit the form
  try {
    form.submit();
    return true;
  } catch (e) {
    console.error('Form submission error:', e);
    return false;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'fillSurvey') {
    fillSurvey(request.answerIndex, request.fillComments);
    if (request.autoSubmit) {
      setTimeout(() => submitSurvey(), 500);
    }
    sendResponse({ success: true });
  } else if (request.action === 'submitSurvey') {
    submitSurvey();
    sendResponse({ success: true });
  } else if (request.action === 'autoFillAll') {
    autoFillAllSurveys(request.answerIndex, request.fillComments);
    sendResponse({ success: true, count: getEvaluateLinksCount() });
  }
  return true;
});

function fillSurvey(answerIndex, fillComments) {
  // Find all radio button groups
  const radioGroups = document.querySelectorAll('.AspireRadioButtonList');
  
  let filledCount = 0;
  
  radioGroups.forEach(group => {
    // Get all radio buttons in this group
    const radios = group.querySelectorAll('input[type="radio"]');
    
    // Select the radio button at the specified index
    if (radios[answerIndex]) {
      radios[answerIndex].checked = true;
      radios[answerIndex].click(); // Trigger click event
      filledCount++;
    }
  });
  
  // Fill comment fields if enabled
  if (fillComments) {
    const textareas = document.querySelectorAll('textarea.form-control');
    textareas.forEach(textarea => {
      if (!textarea.value) {
        textarea.value = 'Good teaching and course content.';
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        textarea.dispatchEvent(event);
      }
    });
  }
  
  console.log(`Filled ${filledCount} questions`);
  
  // Show visual feedback
  showNotification(`✅ Filled ${filledCount} questions successfully!`);
}

function submitSurvey() {
  // Find the submit button
  const submitBtn = document.querySelector('#BodyPH_surveyUserControl_btnSubmit');
  
  if (submitBtn) {
    // Try multiple methods to submit the form
    
    // Method 1: Use our custom postback function
    const success = executePostback('ctl00$BodyPH$surveyUserControl$btnSubmit', '', true, 'Survey');
    
    if (success) {
      showNotification('📤 Survey submitted!');
      return;
    }
    
    // Method 2: Try the WebForm_DoPostBackWithOptions if available
    if (typeof WebForm_DoPostBackWithOptions !== 'undefined' && typeof WebForm_PostBackOptions !== 'undefined') {
      try {
        WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(
          "ctl00$BodyPH$surveyUserControl$btnSubmit", 
          "", 
          true, 
          "Survey", 
          "", 
          false, 
          true
        ));
        showNotification('📤 Survey submitted!');
        return;
      } catch (e) {
        console.error('WebForm postback error:', e);
      }
    }
    
    // Method 3: Dispatch mouse event
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    submitBtn.dispatchEvent(clickEvent);
    showNotification('📤 Survey submitted!');
  } else {
    showNotification('❌ Submit button not found');
  }
}

function getEvaluateLinksCount() {
  const evaluateLinks = document.querySelectorAll('a[href*="SurveyStudentCourseWise"]');
  return evaluateLinks.length;
}

function autoFillAllSurveys(answerIndex, fillComments) {
  // Check if we're on the survey list page
  const evaluateLinks = document.querySelectorAll('a[href*="SurveyStudentCourseWise"]');
  
  if (evaluateLinks.length === 0) {
    showNotification('❌ No surveys found on this page');
    return;
  }
  
  showNotification(`🔄 Found ${evaluateLinks.length} surveys. Starting auto-fill...`);
  
  // Store settings in sessionStorage for use in survey pages
  // We'll keep checking for "Evaluate" links until none remain
  sessionStorage.setItem('autoFillSettings', JSON.stringify({
    answerIndex: answerIndex,
    fillComments: fillComments,
    totalSurveys: evaluateLinks.length,
    startTime: Date.now(),
    returnUrl: window.location.href
  }));
  
  // Click the first evaluate link
  if (evaluateLinks[0]) {
    setTimeout(() => {
      evaluateLinks[0].click();
    }, 500);
  }
}

// Listen for navigation back to survey list page
window.addEventListener('pageshow', function(event) {
  const autoFillSettings = sessionStorage.getItem('autoFillSettings');
  
  if (autoFillSettings) {
    const settings = JSON.parse(autoFillSettings);
    
    // Wait a bit for page to fully load, then check for more surveys
    setTimeout(() => {
      // Check if we're back on the survey list page
      const evaluateLinks = document.querySelectorAll('a[href*="SurveyStudentCourseWise"]');
      
      // Also check if we're NOT on a survey form page
      const submitBtn = document.querySelector('#BodyPH_surveyUserControl_btnSubmit');
      
      if (!submitBtn && evaluateLinks.length > 0) {
        // We're on the list page and there are more surveys
        const processed = settings.totalSurveys - evaluateLinks.length;
        showNotification(`🔄 Processing survey ${processed + 1}/${settings.totalSurveys}... (${evaluateLinks.length} remaining)`);
        
        // Click the first available link
        setTimeout(() => {
          const links = document.querySelectorAll('a[href*="SurveyStudentCourseWise"]');
          if (links.length > 0) {
            links[0].click();
          }
        }, 500);
      } else if (!submitBtn && evaluateLinks.length === 0) {
        // No more surveys - all done!
        sessionStorage.removeItem('autoFillSettings');
        showNotification('🎉 All surveys completed! No more Evaluate links found.', 5000);
      }
    }, 2000);
  }
});

// Check if we're on a survey page and auto-fill is enabled
window.addEventListener('load', function() {
  const autoFillSettings = sessionStorage.getItem('autoFillSettings');
  
  if (autoFillSettings) {
    const settings = JSON.parse(autoFillSettings);
    
    // Check if this is a survey form page
    const submitBtn = document.querySelector('#BodyPH_surveyUserControl_btnSubmit');
    
    if (submitBtn) {
      // This IS a survey form - auto-fill and submit it
      console.log('Survey form detected - auto-filling...');
      
      setTimeout(() => {
        showNotification(`📝 Filling survey...`);
        fillSurvey(settings.answerIndex, settings.fillComments);
        
        // Auto-submit after a short delay
        setTimeout(() => {
          showNotification(`📤 Submitting survey...`);
          
          // Use our custom postback function first
          const success = executePostback('ctl00$BodyPH$surveyUserControl$btnSubmit', '', true, 'Survey');
          
          if (!success) {
            console.log('Executepostback failed, trying WebForm method...');
            // Fallback: try WebForm method
            if (typeof WebForm_DoPostBackWithOptions !== 'undefined' && typeof WebForm_PostBackOptions !== 'undefined') {
              try {
                WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions(
                  "ctl00$BodyPH$surveyUserControl$btnSubmit", 
                  "", 
                  true, 
                  "Survey", 
                  "", 
                  false, 
                  true
                ));
              } catch (e) {
                console.log('WebForm method failed, trying event dispatch...', e);
                // Final fallback to event dispatch
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                submitBtn.dispatchEvent(clickEvent);
              }
            } else {
              console.log('WebForm not available, using event dispatch...');
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              submitBtn.dispatchEvent(clickEvent);
            }
          }
        }, 1500);
      }, 1000);
    } else {
      // Not a survey form - check if we're on the list page
      console.log('Not a survey form, checking for evaluate links...');
      
      setTimeout(() => {
        const evaluateLinks = document.querySelectorAll('a[href*="SurveyStudentCourseWise"]');
        console.log(`Found ${evaluateLinks.length} evaluate links`);
        
        if (evaluateLinks.length > 0) {
          // Continue processing - click the FIRST available link
          const processed = settings.totalSurveys - evaluateLinks.length;
          showNotification(`🔄 Found ${evaluateLinks.length} more surveys. Processing next...`);
          
          setTimeout(() => {
            const links = document.querySelectorAll('a[href*="SurveyStudentCourseWise"]');
            if (links.length > 0) {
              console.log('Clicking first evaluate link...');
              links[0].click();
            }
          }, 500);
        } else {
          // No more surveys - we're done!
          console.log('No more surveys found - completing...');
          sessionStorage.removeItem('autoFillSettings');
          showNotification('🎉 All surveys completed! No more Evaluate links found.', 5000);
        }
      }, 1000);
    }
  }
});

function showNotification(message, duration = 3000) {
  // Remove existing notification if any
  const existing = document.querySelector('.survey-auto-filler-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'survey-auto-filler-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Remove notification after duration
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}
