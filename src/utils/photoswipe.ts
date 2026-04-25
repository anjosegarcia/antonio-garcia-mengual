export const initPhotoSwipeWithCaptions = (lightbox: any) => {
  lightbox.on("uiRegister", () => {
    const pswp = lightbox.pswp;
    if (!pswp) return;

    pswp.ui.registerElement({
      name: "custom-caption",
      order: 9,
      isCustomElement: true,
      tagName: "div",
      appendTo: "root",
      onInit: (el: HTMLElement, pswp: any) => {
        pswp.on("change", () => {
          const currSlideElement = pswp.currSlide?.data?.element;
          if (currSlideElement) {
            const category =
              currSlideElement.getAttribute("data-pswp-category") || "";
            const title =
              currSlideElement.getAttribute("data-pswp-title") || "";
            const year = currSlideElement.getAttribute("data-pswp-year") || "";
            const material =
              currSlideElement.getAttribute("data-pswp-material") || "";
            const dimensions =
              currSlideElement.getAttribute("data-pswp-dimensions") || "";

            let captionHTML = `<div class="pswp-caption-content">`;
            if (category)
              captionHTML += `<span class="pswp-caption-category">${category.replace(/-/g, " ")}</span>`;
            if (title || year) {
              captionHTML += `<span class="pswp-caption-title">${title}${year ? ` <span class="pswp-caption-year-small">(${year})</span>` : ""}</span>`;
            }
            if (material || dimensions) {
              captionHTML += `<div class="pswp-caption-meta">`;
              if (material) captionHTML += `<span>${material}</span>`;
              if (dimensions) captionHTML += `<span>${dimensions}</span>`;
              captionHTML += `</div>`;
            }
            captionHTML += `</div>`;
            el.innerHTML = captionHTML;
          }
        });
      },
    });
  });

  lightbox.on("gettingData", (event: any) => {
    const { data } = event;
    if (data && data.img) {
      const img = data.img as HTMLImageElement;
      if (img.naturalWidth && !data.width) {
        data.width = img.naturalWidth;
        data.height = img.naturalHeight;
      }
    }
  });
};
