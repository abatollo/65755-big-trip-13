import {MenuItem} from "../const.js";
import AbstractView from "./abstract-view.js";

const createMenuTemplate = () =>
  `<nav class="trip-controls__trip-tabs  trip-tabs">
    <a class="trip-tabs__btn trip-tabs__btn--active" href="#" data-menu-type="${MenuItem.TABLE}">${MenuItem.TABLE}</a>
    <a class="trip-tabs__btn" href="#" data-menu-type="${MenuItem.STATS}">${MenuItem.STATS}</a>
  </nav>
`;

export default class TripTabsView extends AbstractView {
  constructor() {
    super();

    this._activeItem = MenuItem.TABLE;
    this._menuClickHandler = this._menuClickHandler.bind(this);
  }

  getTemplate() {
    return createMenuTemplate();
  }

  setMenuClickHandler(callback) {
    this._callbacks.menuClick = callback;
    this.getElement().addEventListener(`click`, this._menuClickHandler);
  }

  setMenuItem(menuItem) {
    const item = this.getElement().querySelector(`[data-menu-type="${menuItem}"]`);

    if (item !== null) {
      item.classList.add(`trip-tabs__btn--active`);
    }
  }

  _menuClickHandler(evt) {
    if (evt.target.tagName !== `A`) {
      return;
    }

    evt.preventDefault();
    this._callbacks.menuClick(evt.target.dataset.menuType);
  }
}
