import React, { Component } from 'react'
import Item from './item'

export class Items extends Component {
  render() {
    return (
      <main>
        {this.props.items.map(el => (
            <Item 
              key={el.id} 
              item={el} 
              onShowItem={this.props.onShowItem} 
              onAdd={this.props.onAdd}
              onDelete={this.props.onDelete}
              orders={this.props.orders}
            />
        ))}
      </main>
    )
  }
}

export default Items