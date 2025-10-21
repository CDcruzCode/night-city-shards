var headers;

function searchShard(searchBox) {
  const searchTerm = searchBox.value.trim().toUpperCase();
  const divsToHide = document.querySelectorAll(".titleBox");
  headers = document.querySelectorAll(".section_header");

  divsToHide.forEach(element => {
    element.style.display = (searchTerm === "" || 
                             (searchTerm === "#AUDIO" && element.classList.contains("has_audio")) ||
                             (searchTerm === "#PHANTOM" && element.classList.contains("phantom_liberty")) ||
                             (element.querySelector("span").innerText.toUpperCase().includes(searchTerm)))
                             ? "flex" : "none";
  });

  calculate_shard_number();
}

function selectFlexElements(containerId) {

  // Select all child elements of the container
  const allElements = containerId.querySelectorAll('*');

  // Filter elements with display: flex
  const flexElements = Array.from(allElements).filter(element => {
    return window.getComputedStyle(element).display === 'flex';
  });

  return flexElements;
}

function calculate_shard_number() {
  headers.forEach(head => {
    let list_size = selectFlexElements(head.nextElementSibling);
    let num_display = head.querySelector("span");
    num_display.innerHTML = `(${list_size.length})`;
  });
}