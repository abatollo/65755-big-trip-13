import dayjs from "dayjs";
import TripInfo from "./view/trip-info.js";
import Tabs from "./view/trip-tabs.js";
import TripFilters from "./view/trip-filters.js";
import TripSort from "./view/trip-sort.js";
import EventsList from "./view/events-list.js";
import EventEdit from "./view/event-edit.js";
import Event from "./view/event.js";
import {generatePoint, OFFERS} from "./mock/trip.js";
import {render, RenderPosition} from "./utils.js";

const POINT_COUNT = 20;
const points = new Array(POINT_COUNT).fill().map(generatePoint).sort((firstEl, secondEl) => dayjs(secondEl.dateFrom).valueOf() - dayjs(firstEl.dateFrom).valueOf());

// Число необходимых к отрисовке точек маршрута 
const TRIP_EVENTS_AMOUNT = 20;

// -=-=-=-=-
// ШАПКА
// -=-=-=-=-

// Находим элементы шапки

// Находим в шапке общий контейнер, в который помещяются  
// а) контейнер с информацией о путешествии (пунктами назначения, датами и стоимостью);
// б) контейнер с контролами (вкладками и фильтрами), который уже есть в разметке;
// в) кнопка New event, которая уже есть в разметке.
const siteTripMainElement = document.querySelector(`.trip-main`);

// Находим в шапке контейнер с контролами (вкладками и фильтрами).
const siteTripControlsElement = siteTripMainElement.querySelector(`.trip-controls`);

// Находим первый невидимый заголовок, с текстом "Switch trip view", сразу за которым отрисуем вкладки (Table и Stats)
const siteTripControlsFirstHeadingElement = siteTripControlsElement.querySelector(`h2:first-of-type`);

// Находим второй невидимый заголовок, стекстом "Filter events", сразу за которым отрисуем фильтры: форму с радиокнопками (Everything, Future и Past)
const siteTripControlsLastHeadingElement = siteTripControlsElement.querySelector(`h2:last-of-type`);

// Отрисовываем элементы шапки

// Отрисовываем контейнер с информацией о путешествии (пунктами назначения, датами и стоимостью) в общий контейнер в шапке
render(siteTripMainElement, new TripInfo().getElement(), RenderPosition.AFTERBEGIN);

// Отрисовываем вкладки (Table и Stats) в контейнер с контролами, расположенный в общем контейнере в шапке
render(siteTripControlsFirstHeadingElement, new Tabs().getElement(), RenderPosition.AFTEREND);

// Отрисовываем фильтры: форму с радио-кнопками (Everything, Future и Past) — в контейнер с контролами, расположенный в общем контейнере в шапке
render(siteTripControlsLastHeadingElement, new TripFilters().getElement(), RenderPosition.AFTEREND);

// -=-=-=-=-
// ОСНОВНОЕ СОДЕРЖИМОЕ
// -=-=-=-=-

// Находим элемент основного содержимого

// Находим в основном содержимом общий контейнер, в который помещаются 
// а) сортировка: форма с радиокнопками (Day, Event, Time, Price, Offers);
// б) список с пунктами.
const siteTripEventsElement = document.querySelector(`.trip-events`);

// Отрисовываем элементы основного содержимого

// Отрисовываем сортировку: форму с радиокнопками (Day, Event, Time, Price, Offers) — в конце основного содержимого
render(siteTripEventsElement, new TripSort().getElement(), RenderPosition.BEFOREEND);

// Отрисовываем список в конец основного содержимого
render(siteTripEventsElement, new EventsList().getElement(), RenderPosition.BEFOREEND);

// Находим список после того, как он отрисовался
const eventsListComponent = siteTripEventsElement.querySelector(`.trip-events__list`);

const TripTask = (eventsListElement, point, overallOffersList) => {
  const eventComponent = new Event(point);
  const eventEditComponent = new EventEdit(point, overallOffersList);

  const replaceCardToForm = () => {
    eventsListElement.replaceChild(eventEditComponent.getElement(), eventComponent.getElement());
  };

  const replaceFormToCard = () => {
    eventsListElement.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
  };

  eventComponent.getElement().querySelector(`.event__rollup-btn`).addEventListener(`click`, () => {
    replaceCardToForm();
  });

  eventEditComponent.getElement().querySelector(`form`).addEventListener(`submit`, (evt) => {
    evt.preventDefault();
    replaceFormToCard();
  });

  render(eventsListElement, eventComponent.getElement(), RenderPosition.BEFOREEND);
};

for (let i = 0; i < TRIP_EVENTS_AMOUNT; i++) {
  // Отрисовываем пункт(ы) — в конце списка в основном содержимом 
  TripTask(eventsListComponent, points[i], OFFERS);
}
