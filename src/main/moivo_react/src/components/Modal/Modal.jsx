import React, { useState } from 'react';
import styles from '../../assets/css/modal.module.css';
import { useNavigate } from 'react-router-dom';

const Modal = ({ isOpen, onClose, title, items, onRemove, onQuantityChange }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === styles.modalOverlay) {
      onClose();
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const handleItemSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(id => onRemove(id));
    setSelectedItems([]);
  };

  const handleCheckout = () => {
    if (!isLoggedIn()) {
      navigate('/user');
    } else {
      // 결제 화면으로 이동
      navigate('/pay', { state: { items: cartItems } });
    }
  };

  const handleMoveToWishlist = () => {
    if (!isLoggedIn()) {
      navigate('/user');
    } else {
      // 위시리스트 화면으로 이동
      navigate('/mypage/wishlist', { state: { items: wishItems } });
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.modalCloseButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalControls}>
            {items.length > 0 && (
              <button 
                className={styles.deleteSelectedButton}
                onClick={handleDeleteSelected}
                disabled={selectedItems.length === 0}
              >
                선택 삭제 ({selectedItems.length})
              </button>
            )}
          </div>

          <div className={styles.itemsGrid}>
            {items.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleItemSelect(item.id)}
                    className={styles.checkbox}
                  />
                </div>
                <div className={styles.itemImageWrap}>
                  <img src={item.productimg[0].fileurl} alt={item.name} className={styles.itemImage} />
                </div>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemPrice}>₩{item.price.toLocaleString()}</p>
                  {title === "장바구니" && (
                    <div className={styles.quantityControl}>
                      <button 
                        onClick={() => onQuantityChange(item.id, (item.quantity || 1) - 1)}
                        disabled={(item.quantity || 1) <= 1}
                      >-</button>
                      <span>{item.quantity || 1}</span>
                      <button 
                        onClick={() => onQuantityChange(item.id, (item.quantity || 1) + 1)}
                      >+</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {items.length > 0 ? (
          <div className={styles.modalFooter}>
            <div className={styles.totalPrice}>
              <span>총 금액</span>
              <strong>₩{getTotalPrice().toLocaleString()}</strong>
            </div>
            {title === "장바구니" && (
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                결제하기 <i className="fas fa-arrow-right"></i>
              </button>
            )}
            {title === "위시리스트" && (
              <button className={styles.moveToWishlistBtn} onClick={handleMoveToWishlist}>
                나의 위시리스트로 이동하기 <i className="fas fa-heart"></i>
              </button>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <i className={`fas ${title === "장바구니" ? "fa-shopping-cart" : "fa-heart"}`}></i>
            <p>{title === "장바구니" ? "장바구니가 비어있습니다." : "위시리스트가 비어있습니다."}</p>
            <button className={styles.shopBtn} onClick={onClose}>쇼핑 계속하기</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 