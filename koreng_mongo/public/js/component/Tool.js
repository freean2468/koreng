'use strict';

const e = React.createElement;

class Tool extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'Hellow';
    }

    return (
        <div>
            <Header></Header>
        </div>
    );
  }
}

const domContainer = document.querySelector('#tool');
ReactDOM.render(e(Tool), domContainer);