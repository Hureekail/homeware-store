import React, { Component } from 'react'
import { FaTrash } from 'react-icons/fa'
import CustomCarousel from './imageSlider';

export class ShowFullItem extends Component {
  render() {
    const isInCart = this.props.orders && this.props.orders.some(order => order.id === this.props.item.id);

    // Create array of images for the carousel
    const carouselImages = [
      <img 
        key="main-image" 
        src={this.props.item.image} 
        alt={this.props.item.name || 'Product image'} 
        onClick={() => this.props.onShowItem(this.props.item)}
        style={{ cursor: 'pointer' }}
      />
    ];
    
    // Add attachments if they exist
    if (this.props.item.attachments) {
      this.props.item.attachments.forEach((attachment, index) => {
        carouselImages.push(
          <img 
            key={attachment.id || index} 
            src={attachment.file} 
            alt={attachment.file_type || 'Product image'} 
            onClick={() => this.props.onShowItem(this.props.item)}
            style={{ cursor: 'pointer' }}
          />
        );
      });
    }

    return (
      <div className='full-item'>
        <div>
            <CustomCarousel>
              {carouselImages}
            </CustomCarousel>
            <h2>{this.props.item.name}</h2>
            <p>{this.props.item.description}</p>
            <b>{this.props.item.price}$</b>
            {isInCart ? (
              <FaTrash 
                className='delete-from-cart' 
                onClick={() => this.props.onDelete(this.props.item.id)}
              />
            ) : (
              <div className='add-to-cart' onClick={() => this.props.onAdd(this.props.item)}>+</div>
            )}
        </div>
      </div>
    )
  }
}

export default ShowFullItem