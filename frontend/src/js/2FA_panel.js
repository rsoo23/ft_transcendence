import { loadPage } from "./router.js";
import { addEventListenerTo } from "./ui_utils/ui_utils.js";
import {
  resetInputField,
} from "./ui_utils/input_field_utils.js";
import { postRequest, getRequest } from "./network_utils/api_requests.js";

export async function init2FAToggle() {
	try {
	  const twoFactorToggle = document.querySelector(".profile-settings-toggle-input");
	  const saveButton = document.getElementById("save-button");
	  
	  // Initialize toggle state - wrap in try/catch
	  try {
		const response = await getRequest('/api/two_factor_auth/status_2FA/');
		twoFactorToggle.checked = response.success;
		let current2FAState = response.success;
  
		if (saveButton) {
		  saveButton.addEventListener("click", () => {
			// Only handle 2FA if the state has changed
			if (twoFactorToggle.checked !== current2FAState) {
			  if (twoFactorToggle.checked) {
				loadPage('2fa_enable');
			  }
			}
		  });
		}
	  } catch (error) {
		console.error('Error initializing 2FA toggle:', error);
		twoFactorToggle.checked = false;
	  }
	} catch (error) {
	  console.error('Error in init2FAToggle:', error);
	}
  }
  
export async function handle2FA() {
  const inputContainers = {
    code: document.getElementById("two-fa-code-input-container"),
  };

  const info = {
    code: document.getElementById("two-fa-code").value,
  };

  if (isInputEmpty(info, inputContainers)) {
    alert("This field is required");
	return "error";
  }

  try {
    const response = await postRequest(
      "/api/two_factor_auth/verify_2FA/",
      info
    );

    if (response.success) {
      alert("2FA Enabled !");
      return "success";
    } else {
        if (response.Status === "2FA Code is Wrong") {
            alert("Incorrect code. Please try again.");
        } else if (response.Status === "2FA Code Timeout") {
            alert("Code has expired. Please request a new one.");
        } else {
			alert("Verification failed. Please try again.");
        }
      return "error";
    }
  } catch (error) {
    console.error("Error:", error);
	alert("An error occurred while verifying 2FA");
    return "error";
  }
}

function isInputEmpty(code, inputContainers) {
  for (let key of Object.keys(code)) {
    if (!code[key]) {
      return true;
    } else {
      resetInputField(inputContainers[key]);
    }
  }
  return false;
}

export function initResendCodeButton(callback) {
  const button = document.getElementById("resend-code-button");

  addEventListenerTo(button, "click", () => {
    callback();
  });

  addEventListenerTo(button, "mouseover", () => {
    button.style.textDecoration = "underline";
  });

  addEventListenerTo(button, "mouseout", () => {
    button.style.textDecoration = "none";
  });

  addEventListenerTo(button, "mousedown", () => {
    button.style.textDecoration = "underline";
  });

  addEventListenerTo(button, "mouseup", () => {
    button.style.textDecoration = "none";
  });
}
