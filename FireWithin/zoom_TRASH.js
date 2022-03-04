console.log('?? module scope in zoom.js');

// CREDITS : https://www.cssscript.com/image-zoom-pan-hover-detail-view/
function addZoom(target) {
  console.log(`?? in addZoom() for target: ${target}`);

  // (A) GET CONTAINER + IMAGE SOURCE
  const container = document.getElementById(target);
  let   imgSrc    = container.currentStyle || window.getComputedStyle(container, false);
  imgSrc = imgSrc.backgroundImage.slice(4, -1).replace(/"/g, "");
  
  // (B) LOAD IMAGE + ATTACH ZOOM
  const img = new Image();
  img.src = imgSrc;
  img.onload = () => {
    // (B1) CALCULATE ZOOM RATIO
    const ratio      = img.naturalHeight / img.naturalWidth;
//  const percentage = ratio * 100 + "%"; ?? NEVER USED
    
    // (B2) ATTACH ZOOM ON MOUSE MOVE
    container.onmousemove = (e) => {
      const rect     = e.target.getBoundingClientRect();
      const xPos     = e.clientX - rect.left;
      const yPos     = e.clientY - rect.top;
      const xPercent = xPos / (container.clientWidth / 100) + "%";
      const yPercent = yPos / ((container.clientWidth * ratio) / 100) + "%";
      
      Object.assign(container.style, {
        backgroundPosition: xPercent + " " + yPercent,
        backgroundSize:     img.naturalWidth + "px" // ?? original
      //backgroundSize:     (img.width / 2) + "px" // ?? new ... NAH
      });
    };
    
    // (B3) RESET ZOOM ON MOUSE LEAVE
    container.onmouseleave = (e) => {
      Object.assign(container.style, {
        backgroundPosition: "center",
        backgroundSize:     "cover"
      });
    };
  }
}


// ?? try full-screen
window.addEventListener('load', () => {
//window.onload = () => {
  // (A) GET ALL IMAGES
  let all = document.getElementsByClassName("zoomE");

  console.log(`?? in full-screen registeror for ${all.length} zoomE targets: `, all);
  
  // (B) CLICK TO GO FULLSCREEN
  if (all.length>0) { for (let i of all) {
    i.onclick = () => {
      // (B1) EXIT FULLSCREEN
      if (document.fullscreenElement != null || document.webkitFullscreenElement != null) {
        if (document.exitFullscreen) { document.exitFullscreen(); }
        else { document.webkitCancelFullScreen(); }
      }
      
      // (B2) ENTER FULLSCREEN
      else {
        if (i.requestFullscreen) { i.requestFullscreen(); }
        else { i.webkitRequestFullScreen(); }
      }
    };
  }}
});
