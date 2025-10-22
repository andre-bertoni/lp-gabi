document.addEventListener("DOMContentLoaded", () => {
    const accordionItems = document.querySelectorAll(".accordion-item");

    accordionItems.forEach(item => {
        const button = item.querySelector(".accordion-button");
        const content = item.querySelector(".accordion-content");

        button.addEventListener("click", () => {
            const isOpen = item.classList.contains("active");

            // Fecha todos os itens
            accordionItems.forEach(i => {
                i.classList.remove("active");
                i.querySelector(".accordion-content").style.maxHeight = null;
            });

            // Abre o item clicado se não estava aberto
            if (!isOpen) {
                item.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});
