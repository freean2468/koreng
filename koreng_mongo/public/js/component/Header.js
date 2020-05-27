'use strict';

class NameForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: ''};
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {
      this.setState({value: event.target.value});
    }
  
    handleSubmit(event) {
      alert('A name was submitted: ' + this.state.value);
      event.preventDefault();
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
            <div id="autocomplete" className="autocomplete">
                <input className="autocomplete-input" name="target"/>
                <ul className="autocomplete-result-list"></ul>
            </div>
          <label>
            Name:
            <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      );
    }
  }

class Form extends React.Component {
    render() {
        return (
            <form>

            </form>
        );
    }
}

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'Header';
    }

    return (
        <header>
            <NameForm></NameForm>
        </header>
    );
  }
}