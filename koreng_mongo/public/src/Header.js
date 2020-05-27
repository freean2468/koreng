'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NameForm = function (_React$Component) {
  _inherits(NameForm, _React$Component);

  function NameForm(props) {
    _classCallCheck(this, NameForm);

    var _this = _possibleConstructorReturn(this, (NameForm.__proto__ || Object.getPrototypeOf(NameForm)).call(this, props));

    _this.state = { value: '' };

    _this.handleChange = _this.handleChange.bind(_this);
    _this.handleSubmit = _this.handleSubmit.bind(_this);
    return _this;
  }

  _createClass(NameForm, [{
    key: 'handleChange',
    value: function handleChange(event) {
      this.setState({ value: event.target.value });
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(event) {
      alert('A name was submitted: ' + this.state.value);
      event.preventDefault();
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'form',
        { onSubmit: this.handleSubmit },
        React.createElement(
          'div',
          { id: 'autocomplete', className: 'autocomplete' },
          React.createElement('input', { className: 'autocomplete-input', name: 'target' }),
          React.createElement('ul', { className: 'autocomplete-result-list' })
        ),
        React.createElement(
          'label',
          null,
          'Name:',
          React.createElement('input', { type: 'text', value: this.state.value, onChange: this.handleChange })
        ),
        React.createElement('input', { type: 'submit', value: 'Submit' })
      );
    }
  }]);

  return NameForm;
}(React.Component);

var Form = function (_React$Component2) {
  _inherits(Form, _React$Component2);

  function Form() {
    _classCallCheck(this, Form);

    return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
  }

  _createClass(Form, [{
    key: 'render',
    value: function render() {
      return React.createElement('form', null);
    }
  }]);

  return Form;
}(React.Component);

var Header = function (_React$Component3) {
  _inherits(Header, _React$Component3);

  function Header(props) {
    _classCallCheck(this, Header);

    var _this3 = _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this, props));

    _this3.state = { liked: false };
    return _this3;
  }

  _createClass(Header, [{
    key: 'render',
    value: function render() {
      if (this.state.liked) {
        return 'Header';
      }

      return React.createElement(
        'header',
        null,
        React.createElement(NameForm, null)
      );
    }
  }]);

  return Header;
}(React.Component);