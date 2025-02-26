/**
 * This class stores the script functionality to create an error Message
 * The messages appear at the bottom left, providing a log feed of content the user
 * can see
 */

const DISPLAY_LOG_MESSAGES = true;
const LOG_DISPLAY_LENGTH = 4000

/**
 * Creates a log message in the editor system that is display to users under the
 * #logfeed html element, assuming the user has log display active
 *
 * Items are displayed in the format
 * <HEADER>: <MESSAGE>
 *
 * @param headerColor - a string containing the color of the header. Can either be JS constants
 *                like "red", or the actual rgb hex value like "#ff0000"
 * @param headerTitle - the title of the log message
 * @param message - the content of the message
 */
export function addlogfeedMessage(headerColor: string, headerTitle: string, message: string) {
  if (!DISPLAY_LOG_MESSAGES) {
    return;
  }

  const logfeed = document.getElementById("logfeed");
  if (logfeed == null) {
    return;
  }

  const logItem = document.createElement("div");
  logItem.classList.add("logfeed-item");
  logItem.innerHTML = createHTMLMessageContent(headerColor, headerTitle, message);

  logfeed.appendChild(logItem);

  setTimeout(() => {
      logItem.remove();
  }, LOG_DISPLAY_LENGTH);
}


/**
 * A helper function user to generate the inner html used to set the content of the new error
 * message
 * @param headerColor - a string containing the color of the header. Can either be JS constants
 *                like "red", or the actual hex value like "#ff0000"
 * @param headerTitle - the title of the log message
 * @param message - the content of the message
 * @returns - the innerhtml content to set the created HTML dom object to
 */
function createHTMLMessageContent(headerColor: string, headerTitle: string, message: string) {
  return `<span style="color: ${headerColor}">${headerTitle}</span>:  ${message}`;
}

