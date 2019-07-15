
document.addEventListener("DOMContentLoaded", () => {
	const navLinks = document.querySelectorAll(".link");
	const sections = document.querySelectorAll(".sections");
	const scrollUpElement = document.querySelector(".scroll-up-section");
	const contantUsForm = document.forms["contact-form"];
	const map = document.querySelector(".map");

	new Navigation(navLinks, sections, scrollUpElement);
	new ValidateContactForm(contantUsForm, {});
	new CharacterCounter(contantUsForm.elements[2]);
	new Localization(map, {lat: -25.344, lng: 131.036});
});



class Navigation {
	constructor(links, sections, scrollUpElement) {
		this.links = [... links];
		this.sections = [... sections];
		this.scrollUpElement = scrollUpElement;
		
		this.bindClickScrollToContent();
		this.bindClickScrollToUp(this.scrollUpElement);
	}
	bindClickScrollToContent(){
		this.links.forEach((element, index) => {
			element.addEventListener('click', e => {
				e.preventDefault();
				this.scrollToContent(this.sections[index])
			});
		});
	}
	scrollToContent(element) {
		window.scrollTo({
			'behavior': 'smooth',
			'top': element.offsetTop	
		});
	}
	bindClickScrollToUp(element) {
		this.scrollUpEventClick(element);
		window.addEventListener("scroll", () => this.isScrollDown() ? element.classList.add("show-scroll-up-element") : element.classList.remove("show-scroll-up-element"));
	}
	scrollUpEventClick(element) {
		element.addEventListener("click", () => this.scrollToUp() );
	}
	scrollToUp() {
		window.scrollTo({
			'behavior': 'smooth',
			'top': 0
		});	
	}
	isScrollDown() {
		return window.pageYOffset > 500;
	}
}



class ValidateContactForm {
	constructor(form, options) {
		this.form = form;
		this.elements = [... this.form.elements];

		const defaultOptions = {
			classErrorInput : 'error-input',
			classErrorPlaceHolder : 'error-placeholder',
			classWarningIcon : 'hidden-warning-icon',
			classWarningSuggestion : 'hidden-warning-suggestion'
		}
		this.options = Object.assign({}, defaultOptions, options);
		this.form.setAttribute('novalidate', 'novalidate');

		this.prepareElements();
		this.bindSubmit();
	}

	prepareElements() {
		this.elements.forEach( element => {
			if(element.nodeName.toUpperCase() === 'INPUT') {
				const type = element.type.toUpperCase();

				if(type === 'TEXT') 
					element.addEventListener('input', e => this.testInputText(e.target));

				if(type === 'EMAIL')
					element.addEventListener('input', e => this.testInputEmail(e.target));
			}

			if(element.nodeName.toUpperCase() === 'TEXTAREA') 
				element.addEventListener('input', e => this.testInputText(e.target));
		});
	}
	showFieldValidation(input, inputIsValid) {
		return !inputIsValid ? this.invalidField(input) : this.validField(input); 
	}
	validField(input) {
		input.classList.remove(this.options.classErrorInput);
		input.parentNode.childNodes[3].classList.remove(this.options.classErrorPlaceHolder);
		input.parentNode.childNodes[5].classList.add(this.options.classWarningSuggestion);
	}
	invalidField(input) {
		input.classList.add(this.options.classErrorInput);
		input.parentNode.childNodes[3].classList.add(this.options.classErrorPlaceHolder);
		input.parentNode.childNodes[5].classList.remove(this.options.classWarningSuggestion);
		input.focus();
	}
	testInputText(input) {
		let inputIsValid = true;
		const pattern = input.getAttribute('pattern');

		if(input.value.match(pattern) == null) 
			inputIsValid = false;

		if(inputIsValid) {
			this.showFieldValidation(input, true);
			return true;
		}
		else {
			this.showFieldValidation(input, false);
			return false;
		}
	}
	testInputEmail(input) {
		const mailReg = input.getAttribute('pattern');

		if(input.value.match(mailReg) == null) {
			this.showFieldValidation(input, false);
			return false;
		}
		else {
			this.showFieldValidation(input, true);
			return true;
		}
	}
	bindSubmit() {
		this.form.addEventListener('submit', e => {
			e.preventDefault();
			let formIsValidated = true;

			this.elements.forEach( element => {
				if(element.nodeName.toUpperCase() === 'INPUT') {
					const type = element.type.toUpperCase();

					if(type === 'TEXT') 
						formIsValidated = (!this.testInputText(element) ? false : formIsValidated);
					if(type === 'EMAIL') 
						formIsValidated = (!this.testInputEmail(element) ? false : formIsValidated);
				}
				if(element.nodeName.toUpperCase() === 'TEXTAREA') 
					formIsValidated = (!this.testInputText(element) ? false : formIsValidated);
				
			});
			return formIsValidated ? e.target.submit() : false;
		});
	}
}
class CharacterCounter {
	constructor(input) {
		this.input = input;
		this.label = this.input.parentNode;
		this.counter = this.label.childNodes[9];
		this.inputMaxLength = this.input.getAttribute("maxlength");

		this.init();
	}
	init(){
		this.changeAfterInputEvent();
		this.changeAfterLoadEvent();
	}
	changeAfterInputEvent() {
		this.input.addEventListener('input', () => {
			this.setCounterColor();
			this.setCounterValue();
		});
	}
	changeAfterLoadEvent() {
		window.addEventListener("load", this.counterChanges());
	}
	counterChanges() {
		this.setCounterColor();
		this.setCounterValue();		
	}
	setCounterColor() {
		return this.counter.innerHTML < 15 ? this.counter.style.color = "#F00" : this.counter.style.color = "grey";
	}
	setCounterValue() {
		return this.counter.innerHTML = this.inputMaxLength - this.input.value.length;
	}
}

class Localization {
	constructor(map, cord, zoom = 4) {
		this.map = map;
		this.cord = cord;
		this.zoom = zoom;
		this.initMap();
	}
	initMap() {
		new google.maps.Map(this.map, {zoom: this.zoom, center: this.cord });
		new google.maps.Marker({position: this.cord, map: this.map});
	}
}
