import TripSortView from "../view/trip-sort.js";
import PointsListView from "../view/points-list.js";
import NoPointView from "../view/no-point.js";
import PointPresenter from "./point.js";
import PointNewPresenter from "./point-new.js";
import {render, RenderPosition, remove} from "../utils/render.js";
import {SortType} from "../const.js";
import {sortByPrice, sortByTime, sortByDate} from "../utils/sort.js";
import {filter} from "../utils/filter.js";
import {UserAction, UpdateType, FilterType} from "../const.js";

export default class Trip {
  constructor(tripEventsContainer, dataModel, filterModel) {
    this._tripEventsContainer = tripEventsContainer;
    this._dataModel = dataModel;
    this._filterModel = filterModel;
    this._pointPresenter = {};
    this._currentSortType = SortType.DAY;

    this._sortComponent = new TripSortView();
    this._pointsListComponent = new PointsListView();
    this._noPointComponent = new NoPointView();

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

    this._pointNewPresenter = new PointNewPresenter(this._pointsListComponent, this._handleViewAction);
  }

  init() {
    render(this._tripEventsContainer, this._pointsListComponent, RenderPosition.BEFOREEND);

    this._dataModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);

    this._renderBoard();
  }

  destroy() {
    this._clearBoard({resetSortType: true});

    remove(this._pointsListComponent);

    this._dataModel.removeObserver(this._handleModelEvent);
    this._filterModel.removeObserver(this._handleModelEvent);
  }

  createPoint() {
    this._currentSortType = SortType.DAY;
    this._filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this._pointNewPresenter.init(this._dataModel);
  }

  _getPoints() {
    const filterType = this._filterModel.getFilter();
    const points = this._dataModel.getPoints().slice();
    const filtredPoints = filter[filterType](points);

    switch (this._currentSortType) {
      case SortType.TIME:
        return filtredPoints.sort(sortByTime);
      case SortType.PRICE:
        return filtredPoints.sort(sortByPrice);
    }
    return filtredPoints.sort(sortByDate);
  }

  _handleModeChange() {
    this._pointNewPresenter.destroy();

    Object
      .values(this._pointPresenter)
      .forEach((presenter) => presenter.resetView());
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this._dataModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this._dataModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this._dataModel.deletePoint(updateType, update);
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        this._pointPresenter[data.id].init(data, this._dataModel);
        break;
      case UpdateType.MINOR:
        this._clearBoard();
        this._renderBoard();
        break;
      case UpdateType.MAJOR:
        this._clearBoard({resetSortType: true});
        this._renderBoard();
        break;
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;
    this._clearBoard();
    this._renderBoard();
  }

  _renderSort() {
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }

    this._sortComponent = new TripSortView(this._currentSortType);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);

    render(this._pointsListComponent, this._sortComponent, RenderPosition.BEFOREBEGIN);
  }

  _sortPoints(sortType) {
    switch (sortType) {
      case SortType.TIME:
        this._points.sort(sortByTime);
        break;
      case SortType.PRICE:
        this._points.sort(sortByPrice);
        break;
      case SortType.DAY:
      default:
        this._points = this._sourcedPoints.slice();
    }

    this._currentSortType = sortType;
  }

  _renderPoint(point) {
    const pointPresenter = new PointPresenter(this._pointsListComponent, this._handleViewAction, this._handleModeChange, true);
    pointPresenter.init(point, this._dataModel);
    this._pointPresenter[point.id] = pointPresenter;
  }

  _renderPoints(points) {
    points.forEach((point) => {
      this._renderPoint(point);
    });
  }

  _renderNoPoints() {
    render(this._tripEventsContainer, this._noPointComponent);
  }

  _clearBoard({resetSortType = false} = {}) {
    this._pointNewPresenter.destroy();

    Object
      .values(this._pointPresenter)
      .forEach((point) => point.destroy());
    this._pointPresenter = {};

    remove(this._sortComponent);
    remove(this._noPointComponent);

    if (resetSortType) {
      this._currentSortType = SortType.DAY;
    }
  }

  _renderBoard() {
    if (this._isLoading) {
      this._renderLoading();
      return;
    }

    const points = this._getPoints();

    if (points.length === 0) {
      this._renderNoPoints();
      return;
    }

    this._renderSort();
    this._renderPoints(points);
  }

  _renderPointsList() {
    render(this._tripEventsContainer, this._pointsListComponent, RenderPosition.BEFOREEND);
  }

  _clearPointsList() {
    Object
      .values(this._pointPresenter)
      .forEach((presenter) => {
        presenter.destroy();
      });
  }

  _handleModeChange(currentPrinter) {
    Object
      .values(this._pointPresenter)
      .forEach((presenter) => {
        if (presenter !== currentPrinter) {
          presenter.resetView();
        }
      });
  }
}
