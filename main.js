/// <reference path="jquery-3.4.1.js" />

"use strict";

// Document - Ready
$(function () {


    // ======================== CONSTANTS VARIABLES ========================

    // ******************************************************************************************
    // For better performance, currently only 1000 currencies records are extracted and used from the 
    // collection retrieved from the currencies API.
    // Number can easily be increased here:
    const NUMBER_OF_CURRENCIES_RECORDS_TO_EXTRACT_FROM_COLLECTION = 1000;
    // ******************************************************************************************

    // Number of simultaneously allowed checked toggle switches before modal element is opened.
    // Value can be decreased/increased here:
    const MAX_ALLOWED_NUMBER_OF_CHECKED_TOGGLE_SWITCHES = 5;

    // Used in currencies chart between one API call to another
    const SECONDS_INTERVAL = 2;

    // Used in more info: Number of minutes allowed to have before gathering more info from API call.
    // If it still in the time frame set up, then retrieve the data from session storage.
    // Value can be decrease/increased here:
    const TIME_GAP_IN_MINUTES = 2;

    // ==========================================================================================



    // ========================= GLOBAL VARIABLES ==========================

    // An array used through out the code, where its length range can be from 0 to MAX_ALLOWED_NUMBER_OF_CHECKED_TOGGLE_SWITCHES
    // holds the current currencies symbols to be displayed in the live reports chart
    let reportCandidates = [];

    // Variables used in live reports (chart) section
    let intervalId;
    let checkedResponse = false;



    // ==========================================================================================

    // This code run 1st time on Document Ready:

    // Emptying currencies dynamic container, and temporarily disabling input search box
    $("#currencies-container").empty();
    $("#search-input").prop("disabled", true);

    // Currencies (Home) tab: display handling: show / hide / focus on elements
    prepareDisplayForCurrencies();

    // Asynchronously retrieving currencies data by API rest call.
    getCurrenciesAsync();

    // Display a beautified informative message to the user, hide it after a few seconds.
    displayBeautifiedMsg(`<strong>Scroll down the background image to see more magnificant images with parallax 
        scrolling effect...</strong>`, "alert-info");
    setTimeout(() => {
        $("#alert-line").css("display", "none");
    }, 6000);

    // ==========================================================================================


    // ==========================================================================================
    // Currencies tab functions and events:
    // ==========================================================================================

    // Handle event: button display all currencies clicked
    $("#btn-display-all-currencies").click(() => {

        // hide/clear relevant elements
        $("#alert-line").css("display", "none");
        $("#search-input").val('');
        $("#currencies-container").hide();

        // Display Spinner while displaying currencies cards. Hide Spinner when done.
        // Spinner On
        showSpinner();
        setTimeout(() => {
            $(".crd").each((index, card) => {
                $(card).show()
            });
            
            // Display currencies and hide spinner, using setTimeout
            hideSpinnerAndDisplayCurrencies();
        }, 1000);
        // Get focus on search input text box
        focusOnSearch();
    });

    // ==========================================================================================

    // Handle event: button display only selected currencies clicked;
    // Hide all currencies cards first, then using each loops check against the reportCandidates array 
    // (currently holding the selected currencies), show the card if found.
    // Display spinner while in process.
    $("#btn-display-selected-currencies").on("click", () => {

        // hide relevant elements
        $("#alert-line").css("display", "none");
        $("#currencies-container").hide();

        // hide all cards
        $(".crd").each((index, card) => $(card).hide());

        // Spinner On
        showSpinner();

        let noResultsFound = true;
        reportCandidates.forEach(elem => {
            let cardFound = false;
            $(".crd").each((index, card) => {
                if (!cardFound && elem === $(card).attr("cardSymb")) {
                    // Show the card if found
                    cardFound = true;
                    noResultsFound = false;
                    $(card).show();

                    // Display currencies and hide spinner, using setTimeout
                    hideSpinnerAndDisplayCurrencies();
                }
            });
        });

        // Display a relevant beautified message to the user and hide the spinner if no selected 
        // currencies are found.
        if (noResultsFound) {
            const errMsg = "No currencies selected!";
            const alertCodeClass = "alert-warning";
            // Display beautified message to the user.
            displayBeautifiedMsg(errMsg, alertCodeClass);
            // Spinner Off
            hideSpinner();
        }

        // Either show or hide relevant elements for button clicks.
        showOrHideElementsGroup();
    });

    // ==========================================================================================   

    // on key up, remove the alert message, if such is displayed to the user
    $("#search-input").on("keyup", () => {
        // Search bar key up clicked.
        $("#alert-line").css("display", "none");
    });

    // ==========================================================================================

    // Handle event: button search for currencies clicked;
    // Loop over all currencies cards and look for an exact match of the card's symbol against the 
    // user input. Display the card if found. Display spinner while in process.
    $("#btn-search-currencies").on("click", function () {

        $("main").scrollTop(0);
        $("#alert-line").css("display", "none");

        // Spinner On
        showSpinner();

        // If the search input text box is empty then display all currencies cards.
        // Display spinner while in process.
        if ($("#search-input").val() === '') {
            displayAllCardsWithSpinner();
        } else {
            // The search input text box is not empty. Need to actually perform search in all currencies.
            let found = false;
            $(".crd").each((indx, card) => $(card).hide());
            $("#currencies-container").hide();
            $(".crd").each((indx, card) => {
                // Make a comparison between the user input and the and the current card.
                if ($("#search-input").val().toLowerCase() === $(card).attr("cardSymb")) {
                    $(card).show();
                    found = true;
                    // Found the card!
                    
                    // Display currencies and hide spinner, using setTimeout
                    hideSpinnerAndDisplayCurrencies();
                }
            })

            // If no results are found, hide the spinner, and display a relevant beautified message 
            // to the user.
            if (!found) {
                // Spinner Off
                hideSpinner();
                const errMsg = "No search results found! Looking for another coin?";
                const alertCodeClass = "alert-warning";
                // Display beautified error message to the user.
                displayBeautifiedMsg(errMsg, alertCodeClass);
            }
        }

        // Either show or hide relevant elements for button clicks.
        showOrHideElementsGroup();
    });

    // ==========================================================================================

    // Handle Event: Currencies tab clicked
    $("#currencies-nav-link").click(() => {

        // Update active class for the selected (clicked) nav link
        updateActiveNavLink($(this));
        // Spinner On
        showSpinner();

        // Display all currencies cards. Show spinner in process.
        displayAllCardsWithSpinner();

        // Currencies (home) tab: display handling: show / hide / focus on elements
        prepareDisplayForCurrencies();
    });

    // ==========================================================================================

    // Get focus on search input text box
    function focusOnSearch() {
        $("#search-input").focus();
    } // End of function focusOnSearch

    // ==========================================================================================

    // Display all currencies cards. Show spinner in process.
    function displayAllCardsWithSpinner() {
        $(".crd").each((indx, card) => $(card).show());
        setTimeout(() => {
            // Spinner Off
            hideSpinner();
            // Display currencies container content
            $("#currencies-container").show();
        }, 1000)
    } // End of function displayAllCardsWithSpinner

    // ==========================================================================================

    // Display currencies and hide spinner, using setTimeout
    function hideSpinnerAndDisplayCurrencies() {
        setTimeout(() => {
            // Spinner Off
            hideSpinner();
            $("#currencies-container").show();
        }, 1000);
    } // End of function hideSpinnerAndDisplayCurrencies

    // ==========================================================================================

    // Either show or hide relevant elements for button clicks.
    function showOrHideElementsGroup() {
        $("main").scrollTop(0);
        $("#about").hide();
        $("#live-reports").hide();
        $("#coins-animation-gif").hide();
        $("#my-modal").hide();
        $("#homepage").show();
        // Get focus on search input text box
        focusOnSearch();
    } // End of function showOrHideElementsGroup

    // ==========================================================================================

    // Currencies (home) tab: display handling: show / hide / focus on elements
    function prepareDisplayForCurrencies() {
        showOrHideElementsGroup();
        $("#header-parallax-scrolling-images").show();
        $("#alert-line").css("display", "none");
        $("#welcome-sentence").show();
        $("#search-input").show();
        $(".currencies-menu-elements").show();
        $("#earth-giphy-welcome").show();
        $("#rain-of-coins").hide();
        $(".my-card").hide();
    } // End of function prepareDisplayForCurrencies

    // ==========================================================================================

    // Asynchronously retrieving currencies data by API rest call, using async await, put it in 
    // an array, and then call another function to handle the currencies objects inside
    async function getCurrenciesAsync() {

        // Handle exception in case there's such
        try {
            // Hide current currencies container displayed and show loading spinner
            $("#currencies-container").hide();
            $("#search-input").val('');
            // Spinner on
            showSpinner();

            const wholeCurrenciesFromAPI = await getData("https://api.coingecko.com/api/v3/coins/list");
            // Completed retrieving currencies data by API rest call. Continue only when done.

            // Extracts predifined number of currencies to work with from the whole currencies retrieved 
            // from API.
            let currencies = [];
            $.each(wholeCurrenciesFromAPI, function (index, value) {
                if (index < NUMBER_OF_CURRENCIES_RECORDS_TO_EXTRACT_FROM_COLLECTION) {
                    currencies.push(value);
                } else {
                    return false;
                }
            });

            // Call function to further handle the currencies array
            handleCurrenciesArr(currencies);
        } // End of try

        catch (err) {
            // Display beautified error message to the user
            handleURLErrorMsg();
        } // End of catch

        finally {
            // On any case, success or error, hide the spinner, and display the current currencies 
            // container.
            // Spinner Off
            hideSpinner();
            $("#currencies-container").show();
        }

    } // End of asynchronous function getCurrenciesAsync

    // ==========================================================================================

    // Run over the currencies array, and create a chain of divs holding the currencies cards, by 
    // calling displayCard function. for better performance, append it to a variable (non-DOM-familiar)
    // instead of a DOM element. only when done, attach the created html chain to the DOM element 
    // container. Then, call another function to handle user next actions (clicks)
    function handleCurrenciesArr(currenciesArr) {
        // Display search input box, and focus on it
        $("#search-input").prop("disabled", false);
        $("#search-input").show();
        // Get focus on search input text box
        focusOnSearch();

        let cardsHtml = $("<div id='cards-container'/>");

        $.each(currenciesArr, (element) => {
            cardsHtml.append(displayCard(currenciesArr[element]));
        });

        $("#currencies-container").html(cardsHtml);

        // Call function to handle next user actions (clicks)
        handleInnerCurrenciesClicks();

    } // End of function handleCurrenciesArr

    // ==========================================================================================

    // Handle 2 available click events:
    // 1. More Info button click
    // 2. Toggle Switch button click
    function handleInnerCurrenciesClicks() {

        // Call to handle More Info button click
        handleMoreInfoClick();

        // Call to handle Toggle Switch button click
        handleToggleSwitchClick();

    } // End of function handleInnerCurrenciesClicks

    // ==========================================================================================

    // Create a chain of divs holding the currencies cards, each contains dedicated elements: 
    // id, symbol, name, switch button, more info button
    function displayCard(currCardObj) {

        let currCard;

        currCard = `<div id='${currCardObj.id}' class="card crd shadow-lg bg-white" cardSymb='${currCardObj.symbol}'>                                
                        <span class="custom-control custom-switch cstm-swtch ml-4">                    
                            <input type="checkbox" coinId=${currCardObj.symbol} class="custom-control-input toggle-class" id='switch-${currCardObj.id}'>
                            <label class="custom-control-label" for='switch-${currCardObj.id}'>
                            </label>
                        </span>
                        <div id='body-${currCardObj.id}' class="my-card-body">
                            <div class="text-uppercase font-weight-bold ml-4" id='symb-${currCardObj.id}'>
                                ${currCardObj.symbol}
                            </div>
                            
                            <div id='name-${currCardObj.id}' class="ml-4">${currCardObj.name}</div>
                            
                            <button id='more-inform-bttn-${currCardObj.id}' class="btn btn-primary more-info-btn ml-4 mb-2 more" type="button" coinId=${currCardObj.id}>More Info</button>
                            <div id='more-info-${currCardObj.id}' class="collapse pl-4">

                            </div>
                    </div>`;

        return currCard;

    } // End of function displayCard

    // ==========================================================================================

    // Display warning message to the user: no currencies selected
    function handleNoCurrenciesToDisplayWarningMsg() {
        const errMsg = "There are no currencies selected!";
        const alertCodeClass = "alert-warning";
        // Display beautified message to the user.
        displayBeautifiedMsg(errMsg, alertCodeClass);
    } // End of function handleNoCurrenciesToDisplayWarningMsg

    // ==========================================================================================


    // ==========================================================================================
    // More Info functions and events:
    // ==========================================================================================

    // When More Info button clicked for a specific currency, collapse (hide/show) a dedicated div 
    // element for it. if it's shown, call another function to display relevant data inside of it.
    function handleMoreInfoClick() {
        // Handle event: more info button clicked
        $("#currencies-container").on("click", ".more", function () {
            // Hide alert message if displayed any
            $("#alert-line").css("display", "none");

            let coinId = $(this).attr("coinId");
            // If currency div is visible, hide it
            if ($(`#more-info-${coinId}`).is(":visible")) {
                $(`#more-info-${coinId}`).hide();
            }
            else {
                // If currency div is hidden, show it, and call function to handle the div's content
                $(`#more-info-${coinId}`).show();
                handleMoreInfoDivDataAsync(coinId);
            }

            // Get focus on search input text box
            focusOnSearch();

        });

    } // End of function handleMoreInfoClick

    // ==========================================================================================

    // Asynchronous function to handle the more info data. Can be retrieved either by API call or by 
    // session storage. At the end, call a function to display the data in the collapsed div.
    async function handleMoreInfoDivDataAsync(coinId) {

        // set up array container to manage more info data
        let moreInfoDataContainer = [];
        // Retrieving data from session storage, if exists
        if (JSON.parse(sessionStorage.getItem("moreInfo")) !== null) {
            moreInfoDataContainer = JSON.parse(sessionStorage.getItem("moreInfo"));
        }

        let existingElementInSessionStorage = moreInfoDataContainer.find(elem => elem.id === coinId);
        // Retrieving the current timestamp (upon click)
        const moreInfoClickedTimestamp = new Date().getTime();

        if (existingElementInSessionStorage !== undefined &&
            !isTimeUp(moreInfoClickedTimestamp, existingElementInSessionStorage.moreInfoTimestamp)) {
            // Found more info for this coin in session storage, and it's up-to-date!
            // Displaying data from it:
            displayCurrencyAdditionalData('#more-info-' + coinId, existingElementInSessionStorage);
        } else {
            // More info data for this coin is either doesn't exist at all in session storage, 
            // or exists there, but has non up-to-date data!
            if (existingElementInSessionStorage !== undefined &&
                isTimeUp(moreInfoClickedTimestamp, existingElementInSessionStorage.moreInfoTimestamp)) {
                // More info data for this coin exists in session storage, but has non up-to-date data!
                moreInfoDataContainer = moreInfoDataContainer.filter(elem => { return elem.id !== existingElementInSessionStorage.id });
            } else if (existingElementInSessionStorage === undefined) {
                // More info doesn't exist in session storage for this coin!
                // console.log("not found!");
            }
            // Getting more info new data by API call...
            // Spinner On
            showSpinner();
            const moreInfo = await getMoreInfoFromRestAPICall(coinId);
            // Completed retrieving more info data by API rest call. Continue only when done.
            const coinObject = createMoreInfoDataPropertiesObject(moreInfo, coinId, moreInfoClickedTimestamp);
            moreInfoDataContainer.push(coinObject);
            // Now we have a new array for session storage.
            // Saving more info for this coin to session storage!
            sessionStorage.setItem("moreInfo", JSON.stringify(moreInfoDataContainer));
            displayCurrencyAdditionalData('#more-info-' + coinId, coinObject);
        }

    } // End of asynchronous function handleMoreInfoDivDataAsync

    // ==========================================================================================

    // boolean function uses predifined TIME_GAP_IN_MINUTES constant.
    // It returns true if defined time has passed.
    // Otherwise returns false.
    function isTimeUp(date1, date2) {
        if (Math.abs(date1 - date2) > TIME_GAP_IN_MINUTES * 1000 * 60) {
            return true;
        }
        return false;
    } // End of function isTimeUp

    // ==========================================================================================

    // Asynchronous function gathering more info data by API call
    async function getMoreInfoFromRestAPICall(coinId) {
        // Handle exception in case there's such
        try {
            const moreInfo = await getData("https://api.coingecko.com/api/v3/coins/" + coinId);
            // Completed retrieving more info data by API rest call. Continue only when done.
            return moreInfo;
        }
        catch (err) {
            $(this).collapse('hide');
            // Display beautified error message to the user
            handleURLErrorMsg();
        }
        finally {
            // Hide the spinner
            hideSpinner();
            // Get focus on search input text box
            focusOnSearch();
        }
    } // End of asynchronous function getMoreInfoFromRestAPICall

    // ==========================================================================================

    // Creates more info data properties object and returns it in order to be send to the session 
    // storage
    function createMoreInfoDataPropertiesObject(moreInfo, coinId, moreInfoClickedTimestamp) {
        const image = moreInfo.image.small;
        const priceUsd = moreInfo.market_data.current_price.usd;
        const priceEur = moreInfo.market_data.current_price.eur;
        const priceIls = moreInfo.market_data.current_price.ils;

        let coinObj = {};
        coinObj.id = coinId;
        coinObj.image = image;
        coinObj.priceUsd = priceUsd;
        coinObj.priceEur = priceEur;
        coinObj.priceIls = priceIls;
        coinObj.moreInfoTimestamp = moreInfoClickedTimestamp;
        return coinObj;
    } // End of function createMoreInfoDataPropertiesObject

    // ==========================================================================================

    // Displays more info data for a coin: image, and 3 prices-USD, EUR, ILS
    function displayCurrencyAdditionalData(moreInfoId, moreInfoData) {
        $(moreInfoId).empty();
        const currencyContent = `<img src=${moreInfoData.image}></img>
        <div>Currency Prices:<br>
        USD: $${moreInfoData.priceUsd}<br>
        EUR: €${moreInfoData.priceEur}<br>
        ILS: ₪${moreInfoData.priceIls}
        </div>`;
        $(moreInfoId).append(currencyContent);
    } // End of function displayCurrencyAdditionalData

    // ==========================================================================================


    // ==========================================================================================
    // Modal functions and events:
    // ==========================================================================================

    // Call to handle Toggle Switch button click
    function handleToggleSwitchClick() {
        let baseCandidatesArr = [];
        let toggleOff;
        let sixthSelection;
        let candidateSymbol;

        // ==========================================================================================

        // Handle event: Toggle button clicked
        $("#currencies-container").on("click", '[id^="switch-"]', function () {
            // Get candidate symbol
            candidateSymbol = $(this).attr("coinId");
            if ($(this).is(':checked')) {
                // if it's checked (toggled on), hide alert, if any
                $("#alert-line").css("display", "none");
                if (reportCandidates.length < MAX_ALLOWED_NUMBER_OF_CHECKED_TOGGLE_SWITCHES) {
                    // Push the symbol to the reportCandidates array if hasn't reached the maximum 
                    // allowed number of checked toggle switches constant
                    reportCandidates.push(candidateSymbol);
                    // Get focus on search input text box
                    focusOnSearch();
                } else {
                    // Maximum allowed number of checked toggle switches constant reached!
                    // Do not push yet, instead trigger modal!
                    $('#my-modal-body').empty();
                    // Toggle off the 6th candidate (the last one triggered the modal), and save its 
                    // symbol for a pre-closing check.
                    $(this).prop('checked', false);
                    sixthSelection = candidateSymbol;
                    // Save the current reportCandidates array: In case of cancelling, will reset
                    // the reportCandidates back to its base state prior to user changes made in modal.
                    baseCandidatesArr = reportCandidates;
                    // Call function to create a candidates chain structure (table), return it and 
                    // append it to the modal's body.
                    let candidatesChain = createCandidatesTableForModalBody();
                    $('#my-modal-body').append(candidatesChain);
                    // Display the modal
                    $("#my-modal").show();

        // ==========================================================================================

                    // Handle event: Clicked toggle off new pick in modal
                    $('[id^="modal-switch-"]').click(function () {
                        reportCandidates = baseCandidatesArr;
                        // Remove from reportCandidates array the one that was toggled off:
                        reportCandidates = reportCandidates.filter(elem => elem !== $(this).attr('symbId'));
                        toggleOff = $(this).attr('symbId');
                        // toggleOff varialbe holds the one to toggle off
                        // For any of candidates exist in the reportCandidates array, toggle on
                        reportCandidates.forEach((elem) => {
                            $('#modal-switch-' + elem).prop('checked', true);
                        });
                    });

                }

            } else {
                // Current toggle element is unchecked (put to off).
                // Remove it from the reportCandidates array (keep all others)
                reportCandidates = reportCandidates.filter(elem => elem !== candidateSymbol);
            }
        });

        // ==========================================================================================

        // Handle event: close modal (perform toggles change)
        $('#btn-close-modal').click(function () {
            // update in currencies container:
            // 1. uncheck the toggle switch that was toggled off
            $(`input[coinId=${toggleOff}]`).prop('checked', false);
            // 2. check the sixth selection picked prior to trigger of the modal
            $(`input[coinId=${sixthSelection}]`).prop('checked', true);
            // push the new symbol selection to the reportCandidates array
            reportCandidates.push(candidateSymbol);
            // Get focus on search input text box
            focusOnSearch();
            // Hide the modal
            $("#my-modal").hide();
        });

        // ==========================================================================================

        // Handle event: cancel modal (cancel button)
        $('#btn-cancel-modal').click(function () {
            // Call a function to get back to the original-base candidates array
            cancelModal(baseCandidatesArr);
        });

        // ==========================================================================================

        // Handle event: cancel modal (X button)
        $('#btn-x-cancel-my-modal').click(function () {
            // Call a function to get back to the original-base candidates array
            cancelModal(baseCandidatesArr);
        });

    } // End of function handleToggleSwitchClick

    // ==========================================================================================

    // Cancel modal actions by reverting to the original-base reportCandidates array
    function cancelModal(baseCandidatesArr) {
        reportCandidates = baseCandidatesArr;
        // Get focus on search input text box
        focusOnSearch();
        // Hide the modal
        $("#my-modal").hide();
    } // End of function closeModal

    // ==========================================================================================

    // Create a table of candidates. Each will have its dedicated toggle switch. Create a chain 
    // (String Interpolation) and return it. Only then it will be appended to the modal's body.
    function createCandidatesTableForModalBody() {
        let candidatesChain = `<div class="container">
            <table class="table table-borderless">
                <thead></thead>
                <tbody>`;
        $.each(reportCandidates, function (symb) {
            candidatesChain += `<tr symbId=${reportCandidates[symb]}>
                <th>${reportCandidates[symb].toUpperCase()}</th>
                <td symbId=${reportCandidates[symb]}></td>
                <td>
                    <label class="modal-switch">
                        <input type="checkbox" symbId='${reportCandidates[symb]}' id='modal-switch-${reportCandidates[symb]}' checked>
                        <span class="modal-slider round"></span>
                    </label>
                </td>
                </tr>`;
        });
        candidatesChain += `</tbody>
            </table>
            </div>`;
        return candidatesChain;
    } // End of function createCandidatesTableForModalBody
    // ==========================================================================================


    // ==========================================================================================
    // About tab event:
    // ==========================================================================================

    // Handle event: About nav link clicked. Hide all irrelevant elements and show only the 
    // about-related ones.
    $("#about-nav-link").click(() => {

        // Update active class for the selected (clicked) nav link
        updateActiveNavLink($(this));

        $("#header-parallax-scrolling-images").hide();
        $("#homepage").hide();
        $("#live-reports").hide();
        $("#coins-animation-gif").hide();
        $("#alert-line").css("display", "none");
        $("#my-modal").hide();
        // Show about div:
        $("#about").show();
        $(".my-card").show();
        $(".currencies-menu-elements").hide();
        $("#welcome-sentence").hide();
        $("#earth-giphy-welcome").hide();
        $("#rain-of-coins").show();
    });


    // ==========================================================================================
    // Live Reports (Chart) functions and events:
    // ==========================================================================================

    // Handle event: Live Reports nav link clicked;
    $("#live-reports-nav-link").click(() => {

        // Update active class for the selected (clicked) nav link
        updateActiveNavLink($(this));

        // Prepare display for Live Reports tab (show/hide relevant elements)
        prepareDisplayForLiveReports();

        // Coin animation gif is displayed prior to currencies chart display
        displayCoinAnimationGif();

        // After 5 seconds waited for the animation gif, hide the gif, and call function to display 
        // live reports for the selected currencies.
        setTimeout(() => {
            // Hide the gif
            $("#coins-animation-gif").hide();
            // Call function to display live reports for the selected currencies
            displayLiveReportsForSelectedCurrencies();
        }, 5000);
    });

    // ==========================================================================================

    // Coin animation gif is displayed prior to currencies chart display
    function displayCoinAnimationGif() {
        $("#coins-animation-gif").show();
        $("#finance-status")[0].play();
        $("#coins-animation-gif").width("40%");
    } // End of function displayCoinAnimationGif

    // ==========================================================================================

    // Prepare display for Live Reports tab (show/hide relevant elements)
    function prepareDisplayForLiveReports() {
        $("#header-parallax-scrolling-images").hide();
        $("#about").hide();
        $("#homepage").hide();
        $("#welcome-sentence").hide();
        $("#my-modal").hide();
        $(".currencies-menu-elements").hide();
        $("#live-reports").show();
        $("#chart-container").hide();
        $("#earth-giphy-welcome").hide();
        $("#rain-of-coins").show();
    } // End of function prepareDisplayForLiveReports

    // ==========================================================================================

    // Display live reports for the selected currencies;
    // Check: If there aren't any report candidates (in range), display a relevant message to the user.
    // If there are report candidates, 
    // In any case, clear interval if exists to start all over again.
    function displayLiveReportsForSelectedCurrencies() {
        checkedResponse = false;
        clearInterval(intervalId);

        if (reportCandidates.length === 0 || reportCandidates > MAX_ALLOWED_NUMBER_OF_CHECKED_TOGGLE_SWITCHES) {

            // There are no report candidates; no currencies selected. Display warning message 
            // to the user
            handleNoCurrenciesToDisplayWarningMsg();

        } else {

            $("#alert-line").css("display", "none");
            $("#chart-container").empty();

            // Give enough time (using setTimeout) for charts to load before displaying data
            waitForChartToLoad();

            // Create chart pattern
            createChart();
        }

    } // End of function displayLiveReportsForSelectedCurrencies

    // ==========================================================================================

    // Create chart pattern for each of the report candidates' symbols
    function createChart() {

        // Call function InitializeChart to initialize chart values, and save it to chartOptions 
        // variable
        const chartOptions = initializeChart();
        // Load the jQuery CanvasJSChart library to the element, using the initialized chart
        $("#chart-container").CanvasJSChart(chartOptions);
        for (const symbol of reportCandidates) {
            chartOptions.data.push({
                type: "spline",
                xValueType: "dateTime",
                yValueFormatString: "###.00$",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,
                name: symbol.toUpperCase(),
                // Initalize dataPoints array to be empty at first
                dataPoints: []
            })
        }

        // Call the chart update every SECONDS_INTERVAL seconds
        intervalId = setInterval(() => {
            // Update the chart Asynchronously
            updateChartAsync();
        }, SECONDS_INTERVAL * 1000);

    } // End of function createChart

    // ==========================================================================================

    // Initialize chart values
    function initializeChart() {
        const chartTextColor = "#4f81bc";
        let chart = {
            title: {
                // For the title: Retrieve the selected symbols list, elements are comma delimeted, 
                // from reportCandidates array
                text: "Live Report! - " + reportCandidates.map(element => element.toUpperCase()).join(', ') + " Currencies Value by USD",
                fontColor: "blue",
                fontSize: 36
            },
            axisX: {
                // axisX is the timeframe, set according to the SECONDS_INTERVAL constant
                title: "Time (updates every " + SECONDS_INTERVAL + " seconds)",
                titleFontColor: chartTextColor,
                labelFontColor: chartTextColor,
                valueFormatString: "hh:mm:ss tt"
            },
            axisY: {
                // axisY represents the coin's currency value in USD
                title: "Coins Value in USD",
                titleFontColor: chartTextColor,
                labelFontColor: chartTextColor
            },
            legend: {
                // Legend
                horizontalAlign: "right",
                verticalAlign: "center",
                fontSize: 20,

                verticalAlign: "top",
                fontColor: "dimGrey"
            },
            // Data array is empty on initalization
            data: []
        }

        // Returns the initialized chart
        return chart;
    } // End of function initializeChart

    // ==========================================================================================

    // Update the chart asynchronously, using async await
    async function updateChartAsync() {
        // Handle exception in case there's such
        try {
            // retrieve chart's DOM handler
            const chart = $("#chart-container").CanvasJSChart();
            const currenciesArr = await getCurrenciesLiveReportsDataAsync();
            // Completed retrieving currenciesArr data array by API rest call

            // Check if currenciesArr is not undefined (undefined=false), due to exception thrown and 
            // returned to here.
            // If it's not undefined (true) then go over using loop on each of the currenciesArr 
            // retrieved from API.
            // Go over using 2nd loop on the chart data existing array, push the new (x,y) values to 
            // the right place determined by comparing symbols between the two arrays.
            if (currenciesArr) {
                for (let upToDateObj of currenciesArr) {
                    for (let chartObj of chart.options.data) {
                        if (upToDateObj.symbol === chartObj.name) {
                            chartObj.dataPoints.push({
                                x: upToDateObj.xValue,
                                y: upToDateObj.yValue
                            });
                            // Display the current price value (y coordinate) in legend
                            chartObj.legendText = `${upToDateObj.symbol}:${upToDateObj.yValue}$`;
                        }
                    }
                }
                // Render the chart
                chart.render();

            }

        } // End of try
        catch (err) {
            // If there's an exception (error), it will be handled on catch section of inner function: 
            // getCurrenciesLiveReportsDataAsync() , including the display of beautified error message 
            // to the user.
            // console.log(err.name);
            // console.log(err.message);
        } // End of catch

    } // End of asynchronous function updateChartAsync

    // ==========================================================================================

    // extract a list of all the coins (in case there's no data for any of the selected currencies). 
    // This list will later on be displayed to the user on error catch.
    function generateMissingCoinsString(dataArray) {
        let missingCoinsStr = dataArray.Message.substr(dataArray.Message.indexOf("/") + 3, dataArray.Message.length - 1);
        missingCoinsStr = missingCoinsStr.slice(0, missingCoinsStr.indexOf(" ") + 1);
        return missingCoinsStr;
    } // End of function generateMissingCoinsString

    // ==========================================================================================

    // Check and handle Live Reports data array response.
    // If reject response is retrieved from the promise, try to find its type (0-bad path, 
    // 2-no data for coins, otherwise just classify it as "error occured").
    // and throw as a new error, with the .
    // OPTION 2 COVERS AN EXCEPTION CASE WHERE *** THERE'S NO DATA AVAILABE AT ALL ***, FOR ALL OF THE 
    // SELECTED CURRENCIES. THEREFORE, THERE'S NOTHING TO DISPLAY TO THE USER.
    // SO, THE POINT HERE IN SUCH CASE, IS TO GET THE ERROR MESSAGE HERE AND NICELY DISPLAY A BEAUTIFIED 
    // ERROR MESSAGE TO THE USER IN THE CATCH SECTION OF FUNCTION: getCurrenciesLiveReportsDataAsync()
    function checkDataArrResponse(dataArray) {
        let errMessage = '';
        if (dataArray.Response === "Error") {
            // ERROR!
            switch (dataArray.Type) {
                case 0:
                    errMessage = "Path does not exist. Please check the link to API.";
                    break;
                case 2:
                    // extract a list of all the coins (in case there's no data for any of the selected 
                    // currencies). This list will later on be displayed to the user on error catch
                    let missingCoinsStr = generateMissingCoinsString(dataArray);
                    errMessage = "There's no data for coin(s) " + missingCoinsStr + ".<br/>Please select another coin to receive online data."
                    break;
                default:
                    errMessage = "Error occured. Please try again later."
            }
            throw new Error(errMessage);
        }

        // If reached here, there was no exception detected, therfore no error was thrown; 
        // check passed OK.
    } // End of function checkDataArrResponse

    // ==========================================================================================

    const getCurrenciesLiveReportsDataAsync = async function () {
        // Handle exception in case there's such
        try {

            let upToDateValues = [];
            // Retrive the currencies symbols string, elements are comma delimeted.
            // The result will be embedded inside the URL
            const currenciesSymbolsStr = (reportCandidates.map(element => element.toUpperCase())).join(',');
            const liveReportsDataArr = await getData(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${currenciesSymbolsStr}&tsyms=USD`);
            // Completed retrieving currencies price data by API rest call. Continue only when done.

            // ***************************************************************
            // Example for a Link with error in it (error type=0 -> bad path):
            // const liveReportsDataArr = await getData(`https://min-api.cryptocompare.com/data/pricemulti1?fsyms=${currenciesSymbolsStr}&tsyms=USD`);
            // ***************************************************************

            // If didn't check the response yet (first API call), check it by calling to function:
            // checkDataArrResponse()
            // Done in order to give it a chance to stop gracefully, including displaying relevant 
            // message to the user, in case there's a bad response.
            // If response is checked already, skip it (no need to check again)
            if (!checkedResponse) {
                checkDataArrResponse(liveReportsDataArr);
                checkedResponse = true;
            }

            // If check passed, then go ahead, and push up-to-date values provided in last API call
            for (let currencySymbKey in liveReportsDataArr) {
                upToDateValues.push({
                    // Currency symbol key
                    symbol: currencySymbKey,
                    // Current date and time
                    xValue: new Date().getTime(),
                    // Current value of currency, in USD
                    yValue: liveReportsDataArr[currencySymbKey].USD
                })
            }

            // return the up-to-date values back in order to display them to the user in another 
            // function
            return upToDateValues;

        } // End of try

        catch (err) {
            // console.log(err.name);
            // console.log(err.message);
            // Display beautified message to the user, clear interval, and hide the chart's main header
            displayBeautifiedMsg(err.message, "alert-warning");
            clearInterval(intervalId);
            $(".canvasjs-chart-canvas").hide();
        } // End of catch

    } // End of asynchronous (anonymous) function getCurrenciesLiveReportsDataAsync

    // ==========================================================================================

    // Give enough time (using setTimeout) for charts to load before displaying data
    function waitForChartToLoad() {
        $("#chart-container").hide();
        showSpinner();
        setTimeout(() => {
            hideSpinner();
            $("#chart-container").show();
        }, 3000);
    } // End of function waitForChartToLoad

    // ==========================================================================================


    // ==========================================================================================
    // General functions and events (used by all app's components):
    // ==========================================================================================


    // Display beautified message to the user.
    function displayBeautifiedMsg(Msg, alertClass) {
        $("#alert-line").css("display", "inline-block");
        $("#alert-line").html(`<div class="alert ${alertClass} alert-dismissible fade show">
        <button type="button" class="close" data-dismiss="alert">&times;</button>
        ${Msg}
        </div>`);
    } // End of function displayBeautifiedMsg

    // ==========================================================================================

    // Get data by asynchronous call - return Promise.
    // If resolved, return json.
    // If rejected, return error
    function getData(url) {
        return new Promise((resolve, reject) => {
            $.getJSON(url, json => {
                resolve(json)
            })
                .fail(err => {
                    console.log(err);
                    reject(
                        new Error("Status: " + err.status + ", Text: " + err.statusText)
                    );
                });
        });
    } // End of function getData

    // ==========================================================================================

    // Update active class for the selected (clicked) nav link
    function updateActiveNavLink(thisElemObj) {
        $(".navbar-nav .nav-link").removeClass("active");
        $(thisElemObj).addClass("active");
    } // End of function updateActiveNavLink

    // ==========================================================================================

    // Display beautified error message to the user
    function handleURLErrorMsg() {
        const errMsg = "<strong>Ooops...Something went wrong... </strong>Please check the link to the remote service, or try again later.";
        const alertCodeClass = "alert-danger";
        // Display beautified message to the user.
        displayBeautifiedMsg(errMsg, alertCodeClass);
    } // End of function handleURLErrorMsg

    // ==========================================================================================

    // Display the spinner
    function showSpinner() {
        $("#spinner").removeClass("hidden");
        $("#spinner").addClass("visible");
    } // End of function showSpinner

    // ==========================================================================================

    // Hide the spinner
    function hideSpinner() {
        $("#spinner").removeClass("visible");
        $("#spinner").addClass("hidden");
    } // End of function hideSpinner

    // ==========================================================================================


}); // end of Document - Ready


// THE END!
