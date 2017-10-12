import React from 'react';
import Fetcher from '../../utilities/fetcher.jsx';

class SearchServiceBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {value: "aa", categories: false};

    }
    componentDidMount(){
        let self = this;
        Fetcher('/api/v1/service-categories').then(function (response) {
            if(!response.error){
                self.setState({categories: response});
            }else{
                console.error("error", response);
            }
        })
    }

    render () {
        return (
            <div className="featured-area">
                <div className="side-columns col-xs-1 col-sm-2 col-md-3"></div>
                <div id="middle-column" className="col-xs-10 col-sm-8 col-md-6">
                    <h1 className="text-center uppercase white p-b-40">Get started!</h1>
                    <form id="search-service-form" className="search">
                        {(this.props.searchValue == "" || this.props.searchValue == null) &&
                            <label id="search-service-label" className="flat-input flat-lg flat-bolder">Search For
                                Services</label>
                        }
                        <div id="search-service" className="form-group flat-input flat-rounded flat-full flat-lg flat-bolder">
                            <input onChange={this.props.handleChange} className="form-control" type="text"/>
                        </div>
                        <div id="search-category" className="form-group flat-input flat-rounded flat-lg flat-bolder float-right caret-right">
                            <select className="form-control" defaultValue="All Services">
                                {this.state.categories.length && this.state.categories.map((cat) =>
                                        <option key={`categories-${cat.id}`}>{cat.name}</option>
                                    )
                                }
                            </select>
                        </div>
                        {/*<i id="search-category-caret" className="fa fa-caret-down"/>*/}
                    </form>
                </div>
                <div className="side-columns col-xs-1 col-sm-2 col-md-3"></div>
            </div>
        );
    }
}

export default SearchServiceBar;