const socket = io();
const SERVER_ADDRESS = "http://localhost:8080";
const CssSelectors = {
    TEMPLATE_PLACEHOLDER: ".template-placeholder",
    HOTELS_TEMPLATE_NAME: "#name",
    HOTELS_TEMPLATE_IMAGE: "#hotel-image",
    SHOW_TEMPLATE_NAME: "#show-field",
    SHOW_TEMPLATE_IMAGE: "#show-image"
};

const templates = {
    hotels: {
        htmlPath: "/templates/hotels.html",
        actionAfterLoad: (params) => {
            const templateSection = document.querySelector('section.hotels');
            if(templateSection) {
                const name = params.name;
                const imageAdders = params.image || "";
                templateSection.querySelector(CssSelectors.HOTELS_TEMPLATE_NAME).innerHTML = name;
                if (imageAdders) {
                    const imgElement = templateSection.querySelector(CssSelectors.HOTELS_TEMPLATE_IMAGE);
                    imgElement.src = imageAdders;
                    imgElement.width = 500;
                    // imgElement.height = imageAdders;
                }
            }
        }
    },
    tvShow: {
        htmlPath: "/templates/tv-show.html",
        actionAfterLoad: (params) => {
            const templateSection = document.querySelector('section.tv-show');
            if (templateSection) {
                const name = params.name
                templateSection.querySelector(CssSelectors.SHOW_TEMPLATE_NAME).innerHTML = name;

                const imageAdders = params.image || "";
                if (imageAdders) {
                    const imgElement = templateSection.querySelector(CssSelectors.SHOW_TEMPLATE_IMAGE);
                    imgElement.src = imageAdders;
                    imgElement.width = 500;
                    // imgElement.height = imageAdders;
                }

            }
        }
    }
}

const path = location.pathname;
const splitedPath = path.split('/');
const id = (path.length < 2) ? 0 : splitedPath[2];

socket.on('connect', () => {
    socket.emit('user_display_screen', id);
})


function main() {

    jQuery(document).ready(() => {
        fetch(`${SERVER_ADDRESS}/ads/${id}`).then(async function (response) {
            if (!response.ok) {
                throw new Error("Http error, status = " + response.status);
            }
            const res = await response.json();
            return res;
        }).then(function (response) {
            function loadAdByTimer(adIndex) {
                if (adIndex >= response.length) {
                    adIndex = 0;
                }
                const currentAd = JSON.parse(response[adIndex]);
                const templateParams = currentAd.templateParams;
                console.log(templateParams);
                const templateRef = templates[currentAd.templateRef];
                jQuery(CssSelectors.TEMPLATE_PLACEHOLDER).load(
                    templateRef.htmlPath,
                    () => {
                        templateRef.actionAfterLoad(templateParams);
                        setTimeout(() => {
                            loadAdByTimer(adIndex + 1);
                        }, currentAd.displayMs);
                    }
                );
            }

            loadAdByTimer(0);
        });
    });
}

main();
