import React, { Component } from 'react';
import axios from 'axios';

class Grid extends Component {
  peopleUrl = 'https://swapi.dev/api/people/';
  speciesUrl = 'https://swapi.dev/api/species/';
  state = {
    list: [],
    page: 1,
    loadingList: true,
    searchText: '',
    searchTimeoutId: null,
    error: null,
    speciesMap: {},
  };

  componentDidMount() {
    this.getSpecies();
    this.getPage();
  }

  getSpecies() {
    axios
      .get(this.speciesUrl)
      .then((res) => {
        if (res.data && res.data.results) {
          var speciesMap = {};
          res.data.results.map((row) => {
            speciesMap[row.url] = row.name;
          });
          this.setState({ speciesMap });
          /this.getPage(this.state.page);
        }
      })
      .catch((err) => {});
  }

  getPage(pageNum) {
    this.resetGridScroll();
    this.setState({ loadingList: true, error: null });
    axios
      .get(
        `${this.peopleUrl}?page=${pageNum ? pageNum : 1}${
          this.state.searchText ? `&&search=${this.state.searchText}` : ''
        }`
      )
      .then((res) => {
        this.setState({ loadingList: false });

        if (res.data && res.data.results) {
          var list = res.data.results;
          this.setState({ list, error: null });
        }
      })
      .catch((err) => {
        this.setState({ loadingList: false, error: `Error: ${err.message}` });
      });
  }

  paginate(navigate) {
    var currentPage = this.state.page;
    if (navigate == 'previous') {
      this.setState({ page: currentPage - 1 });
      this.getPage(currentPage - 1);
    } else {
      this.setState({ page: currentPage + 1 });
      this.getPage(currentPage + 1);
    }
  }

  resetGridScroll() {
    var gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
      gridContainer.scrollLeft = 0;
    }
  }

  getName(name, species) {
    return (
      <span>
        {name}&nbsp;
        {species
          ? species.map((sp) => {
              if (this.state.speciesMap[sp] == 'Human') {
                return <i class="fa fa-user-circle-o" aria-hidden="true"></i>;
              }
              if (this.state.speciesMap[sp] == 'Droid') {
                return <i class="fa fa-android" aria-hidden="true"></i>;
              }
            })
          : ''}
      </span>
    );
  }

  getGrid() {
    return (
      <div
        id="grid-container"
        className={this.state.error ? 'overflow-x-hidden' : ''}
      >
        {this.state.list && this.state.list.length > 0 ? (
          <table id="grid">
            <tr>
              {Object.keys(this.state.list[0]).map((col) => (
                <th className="grid-column">{col.replace('_', ' ')}</th>
              ))}
            </tr>

            {this.state.list.map((row) => {
              return (
                <tr>
                  {Object.keys(row).map((key) => {
                    return (
                      <td className="grid-row">
                        {typeof row[key] == 'string'
                          ? key == 'name'
                            ? this.getName(row[key], row['species'])
                            : row[key]
                          : row[key].join('\n')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </table>
        ) : (
          ''
        )}
        {this.state.loadingList ? (
          <div id="overlay">
            <span class="loading">
              <i class="fa fa-cog" aria-hidden="true"></i>Loading..
            </span>
          </div>
        ) : (
          ''
        )}
        {this.state.error ? (
          <div id="overlay">
            <span class="error">
              <i class="fa fa-exclamation" aria-hidden="true"></i>
              {this.state.error}
            </span>
          </div>
        ) : (
          ''
        )}
        {this.state.list.length == 0 && !this.state.loadingList ? (
          <div id="overlay">
            <span>
              <i class="fa fa-exclamation" aria-hidden="true"></i>
              No results found
            </span>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }

  search(searchText) {
    this.setState({ searchText, page: 1 });
    clearTimeout(this.state.searchTimeoutId);
    var searchTimeoutId = setTimeout(() => {
      this.getPage();
    }, 1000);
    this.setState({ searchTimeoutId });
  }

  render() {
    return (
      <div id="main-container">
        <div id="search-input-container">
          <span>Name:</span>
          <input
            id="search-input"
            //value={this.state.searchText}
            onChange={(e) => this.search(e.target.value)}
          />
        </div>

        {this.getGrid()}

        <div id="pagination-container">
          <span
            className={`pagniation-control ${
              this.state.page <= 1 ? 'display-none' : ''
            }`}
            onClick={() => this.paginate('previous')}
          >
            <i className="fa fa-caret-left" aria-hidden="true"></i>
          </span>{' '}
          {this.state.page}{' '}
          <span
            className={`pagniation-control ${
              this.state.list.length < 10 ? 'display-none' : ''
            }`}
            onClick={() => this.paginate('next')}
          >
            <i className="fa fa-caret-right" aria-hidden="true"></i>
          </span>
        </div>
      </div>
    );
  }
}

export default Grid;
