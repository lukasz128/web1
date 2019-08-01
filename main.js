
document.addEventListener("DOMContentLoaded", () => {
	const navLinks = document.querySelectorAll(".link");
	const sections = document.querySelectorAll(".sections");
	const scrollUpElement = document.querySelector(".scroll-up-section");
	const scrollDownElement = document.querySelector(".visit-element");
	const contantUsForm = document.forms[0];
	const map = document.querySelector(".map");
	const images = document.querySelectorAll(".image-in-article");

	new Navigation(navLinks, sections, scrollUpElement, scrollDownElement);
	new ValidateContactForm(contantUsForm, {});
	new CharacterCounter(contantUsForm.elements[2]);
	new Localization(map, {lat: 47.467537, lng: -122.173134}, 10);
	new LazyLoadImages(images);
});



class Navigation {
	constructor(links, sections, scrollUpElement, scrollDownElement) {
		this.links = [... links];
		this.sections = [... sections];
		this.scrollUpElement = scrollUpElement;
		this.scrollDownElement = scrollDownElement;
		
		this.bindClickScrollToContent();
		this.bindClickScrollToUp(this.scrollUpElement);
		this.bindClickScollToDown(this.scrollDownElement);

	}
	bindClickScrollToContent(){
		this.links.forEach((element, index) => {
			element.addEventListener('click', e => {
				e.preventDefault();
				this.scrollToContent(this.sections[index]);
			});
		});
	}
	scrollToContent(element) {
		window.scrollTo({
			'behavior': 'smooth',
			'top': element.offsetTop	
		});
	}
	// setUrl(index) {
	// 	return setTimeout(() => window.location.replace(this.links[index].href), 500);
	// }
	bindClickScrollToUp(element) {
		this.scrollUpEventClick(element);
		window.addEventListener("scroll", () => this.isScrollDown() ? element.classList.add("show-scroll-up-element") : element.classList.remove("show-scroll-up-element"));
	}
	scrollUpEventClick(element) {
		element.addEventListener("click", this.scrollToUp);
	}
	scrollToUp() {
		window.scrollTo({
			'behavior': 'smooth',
			'top': 0
		});	
	}
	isScrollDown() {
		return window.pageYOffset > 300;
	}
	bindClickScollToDown(element) {
		this.scrollDownEventClick(element);
	}
	scrollDownEventClick(element) {
		element.addEventListener("click", () => this.scrollToDown() );
	}
	scrollToDown() {
		window.scrollTo({
			'behavior': 'smooth',
			'top': this.sections[2].offsetTop
		});
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
		this.counter = this.label.childNodes[7];
		this.inputMaxLength = this.input.getAttribute("maxlength");
		this.momentWarning = parseInt(this.input.getAttribute("data-moment-warning"));

		this.init();
	}
	init(){
		this.changeAfterInputEvent();
		this.changeAfterLoadEvent();
	}
	changeAfterInputEvent() {
		this.input.addEventListener('input', () => this.counterChanges());
	}
	changeAfterLoadEvent() {
		window.addEventListener("load", this.counterChanges());
	}
	counterChanges() {
		this.setCounterColor();
		this.setCounterValue();		
	}
	setCounterColor() {
		return this.counter.innerHTML <= this.momentWarning ? this.counter.style.color = "#F00" : this.counter.style.color = "#AAA";
	}
	setCounterValue() {
		return this.counter.textContent = this.inputMaxLength - this.input.value.length;
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

class LazyLoadImages {
	constructor(images) {
		this.images = [... images];
		this.init();
	}
	init() {
		this.images.forEach(target => {
			const io = new IntersectionObserver((entries, observer) => {
		
				entries.forEach(entry => {
					if(entry.isIntersecting) {
						const img = entry.target;
						const src = img.dataset.src;

						img.setAttribute('src', src);
						img.classList.add('fade');

						observer.disconnect();
					}
					
				});
			});
			io.observe(target);
		});
	}
}