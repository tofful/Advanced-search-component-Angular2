import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Logger } from '../../framework/services/logger.service';

@Component({
    selector: 'pf-search',
    templateUrl: './app/controls/search/search.component.html',
    styleUrls: [ './app/controls/search/search.component.css'],
})

export class SearchComponent {

    /**
     *  <summary>
     *  Accepted parameters by search filters
     *  </summary>
     *  Property: (string) [Required]
     *  Type: (string) : [Required]  => text | number | date | and others HTML5 tags
     *  Label: (string) => [Not Required] text to show in dropdown
     *  Uppercase (boolean) => [Not Required]
     *  SuggestedValues: (array) : [Not Required] =>  ['Maintenance', 'Active', 'Disabled']
     *  IsExactMatch: (boolean) => [Not Required]
     */

    _logger: Logger;

    // --- DEBUG MODE ----- 
    debugMode: boolean = true; // Activate Debug mode to see LOG in console
    // -------------------- 

    //Search Filters, comunicate with father component
    @Input()  public filters: any[];
    @Output() public searchChange = new EventEmitter();

    //Filter options will be displayed as a drop down
    filterOptions: any[] = [];

    //Search placeholder
    placeholder: string = 'Search';

    //Search Message placeholder
    messagePlaceholder: string = "- Tab or Enter";

    //Highlight search
    highlightSearchTerms: boolean = false; // Deactivated for now, needs more development if implement in the future

    //Minimum characters required to type in params
    minimumCharLengthInParams: number = 1; //keep in min for example option MaxPAX could be 9 and is one char

    //Value typed in .inputSearch
    inputSearchValue: string = "";

    //showFilters
    showFilters: boolean = false;

    //Check if ALL filter is selected
    ALLFilterSelected: boolean = false;

    //Clicked in this search box component
    $this: any = null;

    //search params
    searchParams: any[] = [];

    constructor(logger: Logger) {
        this._logger = logger;
        this.toConsole(this.filters);
    }
   
    //Show filter options
    createFilterOptions() {
        if (this.filterOptions.length == 0) {
            //Populate filterOptions
            for (let i: any = 0; i < this.filters.length; i++){
                this.filterOptions.push({
                    Property: this.filters[i].Property,
                    isSelected: false,
                    Label: this.filters[i].Label ? this.filters[i].Label : this.filters[i].Property
                });
            }
        }
    }

    //Click on search box
    clickSearchBox() {
        this.showFilters = true;
        //this.focusSearchBox();
        this.focusSearchBox();
    }

    //Focus on the search box
    focusSearchBox() {

        this.showFilters = true;
        this.createFilterOptions();

        //find all search parameters
        let node: any = $(this.$this).closest(".advancedSearchBox").find(".search input.inputSearch");
            //focus it
        node.focus();
    }

    //Blur search box (loose focus)
    blurSearchBox() {
        //this.showFilters = false;
        setTimeout(() => this.showFilters = false, 150);
    }

    //on key
    onKey(event: KeyboardEvent) {

        let value: any = "";
            value = (<HTMLInputElement>event.target).value;
            value.trim();
        //Enter
        if (event.keyCode == 13) {
            this.toConsole("Enter Key");

            //push new search parameters
            if (value.length >= this.minimumCharLengthInParams) {
                this.searchParams = [];
                this.searchParams.push({
                    Property: 'ALL',
                    Value: value
                });

                //Activate ALL filter selected
                this.ALLFilterSelected = true;

                //Activate dropdown filter options
                for (let i = 0; i < this.filterOptions.length; i++){
                    this.filterOptions[i].isSelected = false;
                }
                
                //@Output event
                this.emitEvent();
            }

            this.focusSearchBox();
            //Check if there is input empty values
            this.removeEmptyValues();
            //Reset value typed in .inputSearch
            this.inputSearchValue = "";
            //
            this.toConsole(this.searchParams);

          
        }

        //ESC
        if (event.keyCode == 27) {
            this.showFilters = false;
            //Set focus
            //this.focusSearchBox();
            //Check if there is input empty values
            this.removeEmptyValues();
            //Reset value typed in .inputSearch
            this.inputSearchValue = "";
            //Hide search filter options
            this.showFilters = false
            this.toConsole("ESC pressed");
        }

        //Tab
        if (event.keyCode == 9) {
            this.toConsole("Tab pressed");

            //change inputSearch placeholder
            this.placeholder = "Search";

            //@Output event 
            this.emitEvent();

            return false;
        }

        //KeyDown Arrow
        if (event.keyCode == 40) {
            this.toConsole("KeyDown pressed");
            return false;
        }

        //KeyUp Arrow
        if (event.keyCode == 38) {
            this.toConsole("KeyUp pressed");
            return false;
        }

        //Backspace
        if (event.keyCode == 8) {
            if (value.length == 0) {
                this.setInputFocus()
            }
            this.toConsole("Backspace pressed");
            return false;
        }

        //Left Arrow
        if (event.keyCode == 37) {
            this.setInputFocus()
            this.toConsole("leftArrow pressed");
            return false;
        }

        //Right Arrow
        if (event.keyCode == 39) {
            this.setInputFocus()
            this.toConsole("RightArrow pressed");
            return false;
        }

    }

    //on key
    onEnterInValue(event: KeyboardEvent) {

        let value: any = "";
            value = (<HTMLInputElement>event.target).value;
            value.trim();

        //Enter
        if (event.keyCode == 13) {
            this.toConsole("Enter Key on parameter Value");
            this.focusSearchBox();
            //Check if there is input empty values
            this.removeEmptyValues();
            //Reset value typed in .inputSearch
            this.inputSearchValue = "";
            //
            //this.toConsole(this.searchParams);

            if (value.length >= this.minimumCharLengthInParams) {
                //@Output event 
                this.emitEvent();
            }

            //change inputSearch placeholder
            this.placeholder = "Search";
        } else {
            //change inputSearch placeholder
            this.placeholder = this.messagePlaceholder;
        }
       
       

    }

    //Select a filter
    selectFilter(event: any, index: any) {
        //Add new element Value, this Value is what user type in searchBox
        this.filters[index].Value = this.inputSearchValue;
        //add new search parameter    
        this.addSearchParameter(this.filters[index]);
        //hide filters
        this.showFilters = false;
        //remove from list
        this.filterOptions[index].isSelected = true;

        this.toConsole("filter selected");

        //Set focus to last element, means last selected
        let box = $(this.$this).closest(".advancedSearchBox");
        setTimeout(() => box.find(".parameter input").last().focus().select(), 100);//set focus and select text
    }

    //Add new search parameter
    addSearchParameter(params: any) {

        this.searchParams.push(params);
        //Set this input focus
        setTimeout(() => this.setInputFocus(), 100);
        
        //Reset value typed in .inputSearch
        this.inputSearchValue = "";

        //If selected is suggested values
        if (params.SuggestedValues) {
            //change inputSearch placeholder
            this.placeholder = "- Select an option";
        }

        if (params.Value.length >= this.minimumCharLengthInParams) {
            //@Output event 
            this.emitEvent();
        }

        //If this is of type date, then 
        if (params.Type == 'date'){
            this.maskDate(params.Property);
            this._logger.log("Initialized datepicker plugin for: " + params.Property);
        }

        this._logger.log("Added new search parameter");
    }

    //Will execute datepicker plugin for given element
    private maskDate(div: string): void {
        setTimeout(() =>
            //datepicker - It needs an #ID and input type Text. Needs a Container to be same #ID
            $("#" + div + " input").mask('00/00/0000')
        , 1);
    }


    //Set parent search box to make reference always to this specific component and not other.
    thisSearchBoxComponent(event: any) {
        this.$this = event.target;
    }

    //Set focus on the last input of last .parameter
    setInputFocus() {
        //A fix in selectFilter();

        //find all search parameters
        let nodes: any = document.querySelectorAll(".advancedSearchBox .parameter .value input");
        //find last one
        let last: any = nodes[nodes.length - 1];
        //focus it
        last.focus();
        //select it
        last.select();

    }

    //Remove search parameter
    removeSearchParameter(event: any, index: number) {

        //find property text to update this.filterOptions
        let Text: string = event.target.nextSibling.nextSibling.innerHTML;
        if (Text == 'ALL') {
            //Deactivate ALL filter selected
            this.ALLFilterSelected = false;
        }
        //add back matched filters to filterOptions
        for ( let i = 0; i < this.filterOptions.length; i++ ){
            if (this.filterOptions[i].Property == Text || this.filterOptions[i].Label == Text) {
                this.filterOptions[i].isSelected = false;
            }
        }

        //Remove element in the object by index
        this.searchParams.splice(index, 1);

        //@Output event 
        this.emitEvent();
    }

    //Remove Empty Parameters
    removeEmptyValues() {

        setTimeout(() => {
            //Remove element in the object by index
            for (let index = 0; index < this.searchParams.length; index++) {

                let param = this.searchParams[index];

                if (param.Property == 'ALL' && param.Value <= this.minimumCharLengthInParams) {
                    //Deactivate ALL filter selected
                    this.ALLFilterSelected = false;
                }
                //If param.Value is empty or has only 1 character, remove it
                if (param.Value === undefined || param.Value === null || param.Value.trim() == "" ||  param.Value.trim().length < this.minimumCharLengthInParams) {

                    //find property text to update this.filterOptions
                    for (let i = 0; i < this.filterOptions.length; i++) {
                        if (this.filterOptions[i].Property == param.Property) {
                            this.filterOptions[i].isSelected = false;
                        }
                    }
                    //Remove it from searchParam
                    this.searchParams.splice(index, 1);
                }

            }

            //@Output event 
            //this.emitEvent();

            this.toConsole("Removed empty parameter and added back to filterOptions");
        }, 150);
    }

    //Add suggested value to input
    addSuggestedValue(event: any, i: any) {
        let value: any = "";
        value = (<HTMLUListElement>event.target).textContent;
        this.searchParams[i].Value = value;
        this.toConsole("added suggested value");
    }

    //Remove all the elements in searchParams
    cleanSearch(event: any) {
        this.searchParams = [];
        //Reset value typed in .inputSearch
        this.inputSearchValue = "";
        //hide filters
        this.showFilters = false;
        

        //add back all filters to filterOptions
        for (let i = 0; i < this.filterOptions.length; i++) {
             this.filterOptions[i].isSelected = false;
        }

        //reset all filter selected
        this.ALLFilterSelected = false;

        //change inputSearch placeholder
        this.placeholder = "Search";

        //@Output event 
        this.emitEvent();

    }

    //Run actions on value input focus
    inputFocusActions(event?: any) {

        //find if this input has suggested values to diplay
        let suggestedValues: any = event.target.nextSibling.nextSibling.nextSibling.nextSibling;
        //If this input nextSibling has class suggestedValues
        if (/(?:^|\s)suggestedValues(?:\s|$)/.test(suggestedValues.className)) {
            // next sibling has foo suggestedValues, display options
            suggestedValues.style.display = 'block';
            //set input readOnly
            event.target.readOnly = true;

            //change inputSearch placeholder
            this.placeholder = "- Select an option";
        }             

    }

    //Run actions on value input loose focus (blur)
    inputBlurActions(event?: any) {

        this.toConsole("Blur input");
        setTimeout(() => {
            let suggestedValues: any = $(this.$this).closest(".advancedSearchBox").find(".suggestedValues"); //document.querySelectorAll(".suggestedValues");
            for (let i = 0; i < suggestedValues.length; i++){
                //remove all elements that matches .suggestedValues class
                suggestedValues[i].style.display = 'none';
            }

            //change inputSearch placeholder
            this.placeholder = "Search";

            //@Output event 
            this.emitEvent();
           
        }, 150);


        //Check if in search params is applied ALL filter
        for (let j = 0; j < this.searchParams.length; j++){
            if (this.searchParams[j].Property == 'ALL') {

                let clone: any = new Array();
                clone = Object.assign(clone, this.searchParams);

                //Remove filters from search parameters
                this.searchParams = [];

                //Assign only ALL property and value
                this.searchParams.push({
                    Property: 'ALL',
                    Value: clone[j].Value
                });

                //Activate dropdown filter options
                for (let i = 0; i < this.filterOptions.length; i++) {
                    this.filterOptions[i].isSelected = false;
                }

            }
        }

    }

    //highlight search
    highlightSearch(event: any) {

        // This Feature is OFF, maybe needed in the future

        if (this.highlightSearchTerms) {
            setTimeout(() => {
                var text = event.target.value;
                text.trim();
                    //if text greater than 1
                    if (text.length > 1) {

                        //check 
                        this.toConsole(text);
                        var query = new RegExp("(\\b" + text + "\\b)", "gim");
                        var e = document.querySelectorAll(".frame .table")[0].innerHTML;
                        var enew = e.replace(/(<span class='hst'>|<\/span>)/igm, "");
                        document.querySelectorAll(".frame .table")[0].innerHTML = enew;
                        var newe = enew.replace(query, "<span class='hst'>$1</span>");
                        document.querySelectorAll(".frame .table")[0].innerHTML = newe;
                    }
            }, 1000);
        }
    }

    //Format Date to dd-mm-YYY
    reformatDate(dateStr: any) {
        let dArr = dateStr.split("-");  // from input "2016-06-15"
        return dArr[2] + "/" + dArr[1] + "/" + dArr[0]; //to out: "15/06/2016 "
    }

    //@Output event, emit search params to send 
    emitEvent() {

        this.toConsole("EventEmmited: Call to API");
        setTimeout(() => this.searchChange.emit(this.searchParams), 150);
        //this.searchChange.emit(this.searchParams);
    }

    //Console Log
    toConsole(log: any) {
        if (this.debugMode) {
            this._logger.log(log);
        }
    }

}