function testWebP(callback) { // проверка поддерки браузером формата webp 

	var webP = new Image();
	webP.onload = webP.onerror = function () {
		callback(webP.height == 2);
	};
	webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) { // есди да  body + класс webp

	if (support == true) {
		document.querySelector('body').classList.add('_webp');
	} else {
		document.querySelector('body').classList.add('_no-webp');
	}
});

let mySl = new MySlaid({
	//orientation: true,
	//isInfinity: true,
	//slaidToPage: 1,
	autoPlay: true,
	timer: 1000,
	//autoPlayOrder: false,
});
console.log(mySl);

//--------------------------------
function MySlaid({
	slaider = `.slaider`,// селектор слайдера
	isInfinity = true,// зацикленный true  незакцикленный false
	orientation = true, // ориентация true горизотальная false-вертикальная
	slaidToPage = 1,// количество одновременно видимых слайдов
	autoPlay = false, // автовоспроизведение true - включено false -выключено
	timer = 3000, // частота смены слайда при автовоспроизведнии
	autoPlayOrder = true, // автовоспроизведнии true -c права- налево или снизу вверх false слева направо и сверзу вниз

}) {

	this.slaider = slaider;
	this.isInfinity = isInfinity;
	this.orientation = orientation;
	this.slaidToPage = slaidToPage;
	this.autoPlay = autoPlay;
	this.timeInterval = timer;

	if (!this.isInfinity) this.autoPlay = false;

	this.slaiderElem = document.querySelector(this.slaider);
	this.slaiderWrapper = document.querySelector(`${this.slaider}__wrapper`);
	this.fieldSwipe = document.querySelector(`${this.slaider}__container`);

	//this.fieldSwipeBounding = this.fieldSwipe.getBoundingClientRect();
	//console.log(this.fieldSwipeBounding);



	// количество слайдов не странице
	if (this.orientation) {
		this.slaiderWrapper.style.width = `${100 / Math.round(this.slaidToPage)}%`
	} else {
		this.slaiderWrapper.style.width = `100%`;
		this.slaiderWrapper.style.height = `${100 / Math.round(this.slaidToPage)}%`
	}



	this.wrapperSizeWidth = parseInt(getComputedStyle(document.querySelector(`${this.slaider}__wrapper`)).width);
	this.wrapperSizeHeight = parseInt(getComputedStyle(document.querySelector(`${this.slaider}__wrapper`)).height);
	this.orientation ? this.wrapperSize = this.wrapperSizeWidth : this.wrapperSize = this.wrapperSizeHeight;

	this.slaidSize = parseInt(getComputedStyle(document.querySelector(`${this.slaider}__slaid`)).width);


	this.buttonPrev = document.querySelector(`${this.slaider}__prev`);
	this.buttonNext = document.querySelector(`${this.slaider}__next`);

	this.allSlaide = document.querySelectorAll(`${this.slaider}__slaid`);
	// добавляем необходмые стили

	this.fieldSwipe.style.overflow = `hidden`;
	this.slaiderElem.style.userSelect = `none`;
	//------------------------
	// добавляем классы ко всем слайдам
	this.allSlaide.forEach((elem, i) => {
		elem.classList.add(`slaid${i + 1}`);
	});
	//---------------------------
	// для бесконечного слайдера при количестве слайдов меньше 3 + два клона 1 и последний
	this.realSlaiderSize = this.allSlaide.length;
	if (this.realSlaiderSize < 3 && this.isInfinity) {
		this.slaiderWrapper.prepend(this.allSlaide[this.allSlaide.length - 1].cloneNode(true));
		this.slaiderWrapper.prepend(this.allSlaide[0].cloneNode(true));
		this.allSlaide = document.querySelectorAll(`${this.slaider}__slaid`);
	}
	// если циклично и кол. слайдов равно кол. одновременно видимых слайдов - фиксирует на экране без кнопок
	if (this.slaidToPage == this.realSlaiderSize && this.isInfinity) {
		this.isInfinity = false;
	}
	// при вертикальном слайдере
	if (!this.orientation) {
		this.slaiderWrapper.style.flexDirection = `column`;
	}
	// кол.слайдов
	this.realSlaiderSize = this.allSlaide.length;
	// конструктор для слайдов
	this.Slaid = function (elem, numberOfSlaid, realNumberOfSlaid) {
		this.element = elem; // слайд элемент
		this.number = numberOfSlaid; // номер слайда по порядку ( от 0)
		this.realNumber = realNumberOfSlaid;//реальный номер слайда 1- активный
		this.realShiftX = 0; // текущее смещение слайда  по x
		this.realShiftY = 0; // текущее смещение слайда  по y
	};
	// массив объектов слайд
	this.slaids = [];
	this.allSlaide.forEach((elem, i) => {
		this.slaids[i] = new this.Slaid(
			elem,
			i,
			i + 1,
		)
		if (this.slaids[i].realNumber > (this.realSlaiderSize - 1) && this.isInfinity) {
			this.slaids[i].realNumber = 0;
		}
	});
	let shift; // смещение слайда
	let isPrevOrNext = true; // в какую сторону было сделано последнее перемещение true-Prev. false-Next
	//let isPrevOrNextNow ; // текущее перемещение true-Prev. false-Next

	// смещаем слайд 
	this.addTransformTranslate = (
		elem,
		{ shiftX = 0,
			shiftY = 0,
		}) => {
		elem.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0px)`;
		elem.realShiftX = shiftX;
		elem.realShiftY = shiftY;
	};
	//-----------------
	// смещаем слайдер в исходную позицию
	if (this.isInfinity) {
		this.slaids.forEach(elem => {
			this.orientation ?
				shift = { shiftX: this.wrapperSize * (elem.realNumber - elem.number) - this.wrapperSize } :
				shift = { shiftY: this.wrapperSize * (elem.realNumber - elem.number) - this.wrapperSize };
			this.addTransformTranslate(elem.element, shift);
			elem.realShiftX = elem.element.realShiftX;
			elem.realShiftY = elem.element.realShiftY;
		});
	}
	// парметры смещения Next 
	this.isNext = (elem) => {
		elem.realNumber--;
		if (elem.realNumber < 0 && this.isInfinity) {
			elem.realNumber = this.realSlaiderSize - 1;
		}
	};
	// парметры смещения prev
	this.isPrev = (elem) => {
		elem.realNumber++;
		if (elem.realNumber > this.realSlaiderSize - 1 && this.isInfinity) {
			elem.realNumber = 0;
		}
	};
	// как смещаем
	this.addTransition = (elem, time) => {
		elem.element.style.transition = ` transform ${time}s cubic-bezier(.11,.19,.02,1.09) 0s`;
	};
	// скрываем кнопки в крайних слайдах при не бесконечной прокурутке при старте
	if (!this.isInfinity) {
		this.buttonPrev.hidden = true;
		if (this.isNextHidden()) {
			this.buttonNext.hidden = true;
		}
	}
	console.log(this.slaids);


	// функция смещения всех слайдов
	this.shift = (func, isPrevOrNextNow) => {

		this.slaids.forEach(elem => {
			let remo = () => elem.element.classList.remove(`active-pre`, `active`, `active-next`);
			func(elem);
			// добавляем классы к активному слайду предыдущему и следующему
			switch (elem.realNumber) {
				case 0:
					remo();
					elem.element.classList.add(`active-pre`);
					break;
				case 1:
					remo();
					elem.element.classList.add(`active`);
					break;
				case 2:
					remo();
					elem.element.classList.add(`active-next`);
					break;
				default:
					remo();
					break;
			}
			// скрываем кнопки в крайних слайдах при не бесконечной прокурутке 
			if (!this.isInfinity) {
				this.buttonPrev.hidden = false;
				this.buttonNext.hidden = false;
				if (this.isPrevHidden.call(this)) {
					this.buttonPrev.hidden = true;
				}
				if (this.isNextHidden.call(this)) {
					this.buttonNext.hidden = true;
				}
			}
			// смещение
			this.orientation ?
				shift = { shiftX: this.wrapperSize * (elem.realNumber - elem.number) - this.wrapperSize } :
				shift = { shiftY: this.wrapperSize * (elem.realNumber - elem.number) - this.wrapperSize };
			this.addTransformTranslate(elem.element, shift);
			elem.realShiftX = elem.element.realShiftX;
			elem.realShiftY = elem.element.realShiftY;
			// как смещаем
			if (!this.isInfinity) {
				this.addTransition(elem, 1);
			} else {
				((!isPrevOrNextNow && elem.realNumber == this.realSlaiderSize - 1) ||
					(isPrevOrNextNow && elem.realNumber == 0)) ?
					this.addTransition(elem, 0) :
					this.addTransition(elem, 1);
			}
		});
		console.log(this.slaids);
	};
	// передаем контекст объекта функциям колбэкам
	let shiftBind = this.shift.bind(this),
		isPrevBind = this.isPrev.bind(this),
		isNextBind = this.isNext.bind(this);
	// обработчиков на кнопки prev и next
	document.querySelector(`${this.slaider}__prev`).addEventListener(`click`, function () {
		shiftBind(isPrevBind, true);
		isPrevOrNext = true;
	});
	document.querySelector(`${this.slaider}__next`).addEventListener(`click`, function () {

		shiftBind(isNextBind, false);
		isPrevOrNext = false;
	});
	//---------------------------------------
	//автовоспроизведение
	this.playSlaidAuto = (is) => {
		let timerId,
			isClick = false;
		function timerPlay() {
			timerId = setInterval(() => {
				(autoPlayOrder) ? shiftBind(isNextBind, false) : shiftBind(isPrevBind, true);
			}, timer);
		}
		if (is) {
			timerPlay();
			// при наведении пауза вопроизведения
			this.slaiderElem.onmouseenter = () => clearInterval(timerId);
			// при нажатии остановка вопроизведения
			this.slaiderElem.onclick = () => {
				clearInterval(timerId);
				isClick = true;
			};
			// при уходе наведения- запуск воспроизведения
			this.slaiderElem.onmouseleave = () => {
				if (!isClick) timerPlay();
			};
		}
	};
	// подключаем автовоспроизведение
	this.playSlaidAuto(this.autoPlay);
	//-------------------------------------

	//-swaipe---------------------------------------------
	/*
	this.getKoord = function (xs = 0, ys = 0, x = 0, y = 0) {
		//console.log(document.querySelector(`.koord__x-start`));
		document.querySelector(`.koord__x-start`).textContent = `X старт ${xs}`;
		document.querySelector(`.koord__y-start`).textContent = `y старт ${ys}`;
		document.querySelector(`.koord__x`).textContent = `X от старта ${x}`;
		document.querySelector(`.koord__y`).textContent = `Y от старта ${y}`;
	};
	let getKoordBind = this.getKoord.bind(this);
	*/
	let posX1, // стартовая позиция
		posY1, // стартовая позиция
		posX2, // финишная позиция
		posY2,// финишная позиция
		deltaX,// смещение от старта
		deltaY,// смещение от старта
		timeStart,// время старта
		timeEnd;//время финиша
	// события для тачскнина или нет
	this.getEvent = () => event.type.search('touch') !== -1 ? event.touches[0] : event;
	// старт свайпа
	this.swipeStart = () => {
		let evt = getEventBind();
		posX1 = evt.clientX;
		posY1 = evt.clientY;
		timeStart = new Date();
		document.addEventListener('touchmove', swipeActionBind);
		document.addEventListener('mousemove', swipeActionBind);
		document.addEventListener('touchend', swipeEndBind);
		document.addEventListener('mouseup', swipeEndBind);
	};
	//  слайд первый - true
	this.isPrevHidden = () => {
		return this.slaids[0].realNumber == 1;
	};
	// слайд последний - true 
	this.isNextHidden = () => {
		return this.slaids[this.realSlaiderSize - 1].realNumber <= this.slaidToPage;
	};
	// свайп
	this.swipeAction = () => {
		let evt = getEventBind(),
			shiftAction;
		posX2 = evt.clientX;
		posY2 = evt.clientY;
		deltaX = posX2 - posX1;
		deltaY = posY2 - posY1;
		if (this.isInfinity) {
			this.slaids.forEach(elem => {
				elem.swipeX = -deltaX;
				elem.swipeY = -deltaY;
				this.orientation ?
					shiftAction = { shiftX: elem.realShiftX - elem.swipeX } :
					shiftAction = { shiftY: elem.realShiftY - elem.swipeY };
				this.addTransformTranslate(elem.element, shiftAction);
			});
		} else {
			this.slaids.forEach(elem => {
				if (this.orientation) {
					(this.isPrevHidden.call(this) && deltaX > 0) || (this.isNextHidden.call(this) && deltaX < 0) ?
						elem.swipeX = 0 : elem.swipeX = -deltaX;
					this.addTransformTranslate(elem.element, {
						shiftX: elem.realShiftX - elem.swipeX,
					});
				} else {
					(this.isPrevHidden.call(this) && deltaY > 0) || (this.isNextHidden.call(this) && deltaY < 0) ?
						elem.swipeY = 0 : elem.swipeY = -deltaY;
					this.addTransformTranslate(elem.element, {
						shiftY: elem.realShiftY - elem.swipeY,
					});
				}
			});
		}
	};
	// стоп свайп
	this.swipeEnd = () => {
		let vX,
			vY,
			swaipeV,
			shiftAction,
			slaidTrans = (obj, isOrient) => {
				obj.forEach(elem => {
					isOrient ?
						shiftAction = { shiftX: elem.realShiftX } :
						shiftAction = { shiftY: elem.realShiftY };
					this.addTransformTranslate(elem.element, shiftAction);
				});
			};
		timeEnd = new Date();
		if (timeEnd - timeStart) {
			vX = deltaX / (timeEnd - timeStart);
			vY = deltaY / (timeEnd - timeStart);
		}
		this.orientation ? swaipeV = vX : swaipeV = vY;

		if (this.isInfinity) {
			if (swaipeV > 0.1) {
				shiftBind(isPrevBind, true);
			} else if (swaipeV < -0.1) {
				shiftBind(isNextBind, false);
			} else {
				slaidTrans(this.slaids, this.orientation);
			}
		} else {
			if (swaipeV > 0.1 && !this.isPrevHidden.call(this)) {
				shiftBind(isPrevBind, true);
			} else if (swaipeV < -0.1 && !this.isNextHidden.call(this)) {
				shiftBind(isNextBind, false);
			} else {
				slaidTrans(this.slaids, this.orientation);
			}
		}
		document.removeEventListener('touchmove', swipeActionBind);
		document.removeEventListener('mousemove', swipeActionBind);
		document.removeEventListener('touchend', swipeEndBind);
		document.removeEventListener('mouseup', swipeEndBind);
	};
	// передаем контекст объекта функциям колбэкам
	let getEventBind = this.getEvent.bind(this),
		swipeActionBind = this.swipeAction.bind(this),
		swipeEndBind = this.swipeEnd.bind(this);
	// обработчики для старта свайпа
	this.fieldSwipe.addEventListener('touchstart', this.swipeStart.bind(this));
	this.fieldSwipe.addEventListener('mousedown', this.swipeStart.bind(this));

	//--------------------------------------------
}


