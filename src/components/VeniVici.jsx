import React, { useState, useEffect } from 'react';
import './Venivici.css';

function Venivici() {
  const [currentItem, setCurrentItem] = useState(null);
  const [banList, setBanList] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Using Metropolitan Museum of Art API 
  const API_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';

  const validObjectIds = [
    436524, 437112, 437113, 459193, 436121, 437438, 437439, 
    436105, 436106, 437440, 459054, 437441, 436107, 436108,
    437442, 436109, 437443, 436110, 437444, 436111, 437445,
    436112, 437446, 436113, 437447, 436114, 437448, 436115,
    437449, 436116, 437450, 436117, 437451, 436118, 437452,
    436119, 437453, 436120, 437454, 459055, 437455, 436122,
    437456, 436123, 437457, 436124, 437458, 436125, 437459,
    436126, 437460, 436127, 437461, 436128, 437462, 436129,
    437463, 436130, 437464, 436131, 437465, 436132, 437466,
    436133, 437467, 436134, 437468, 436135, 437469, 436136
  ];

  const fetchRandomItem = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get a random object ID from our pre-defined list
      const randomIndex = Math.floor(Math.random() * validObjectIds.length);
      const randomObjectId = validObjectIds[randomIndex];
      
      const response = await fetch(`${API_URL}/${randomObjectId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the item has an image and is not banned
      if (data.primaryImage && !isItemBanned(data)) {
        setCurrentItem(data);
        setHistory(prev => [data, ...prev.slice(0, 19)]);
      } else {
        // If no image or banned, try again
        console.log('Item has no image or is banned, fetching another...');
        fetchRandomItem();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch artwork. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load item from history
  const loadItemFromHistory = (item) => {
    setCurrentItem(item);
  };

  const isItemBanned = (item) => {
    return banList.some(banItem => {
      switch (banItem.type) {
        case 'artist':
          return item.artistDisplayName === banItem.value;
        case 'culture':
          return item.culture === banItem.value;
        case 'department':
          return item.department === banItem.value;
        case 'period':
          return item.period === banItem.value;
        default:
          return false;
      }
    });
  };

  const handleAttributeClick = (type, value) => {
    if (!value || value === '') return;
    
    const banItem = { type, value };
    const isBanned = banList.some(item => 
      item.type === type && item.value === value
    );

    if (isBanned) {
      // Remove from ban list
      setBanList(prev => prev.filter(item => 
        !(item.type === type && item.value === value)
      ));
    } else {
      // Add to ban list
      setBanList(prev => [...prev, banItem]);
    }
  };

  const isAttributeBanned = (type, value) => {
    return banList.some(item => item.type === type && item.value === value);
  };

  useEffect(() => {
    fetchRandomItem();
  }, []);

  return (
    <main className="main-content">
      <div className="discovery-section">
        <button 
          className="discover-btn"
          onClick={fetchRandomItem}
          disabled={loading}
        >
          {loading ? 'Discovering...' : 'Discover New Art!'}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {currentItem && (
          <div className="current-item">
            <div className="item-image">
              {currentItem.primaryImage ? (
                <img 
                  src={currentItem.primaryImage} 
                  alt={currentItem.title || 'Artwork'}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <div className="no-image" style={{display: currentItem.primaryImage ? 'none' : 'block'}}>
                🖼️ Image Not Available
              </div>
            </div>
            
            <div className="item-details">
              <h2 className="item-title">{currentItem.title || 'Untitled'}</h2>
              
              <div className="attributes">
                <div className="attribute">
                  <strong>Artist:</strong>{' '}
                  <span 
                    className={`attribute-value ${isAttributeBanned('artist', currentItem.artistDisplayName) ? 'banned' : 'clickable'}`}
                    onClick={() => handleAttributeClick('artist', currentItem.artistDisplayName)}
                  >
                    {currentItem.artistDisplayName || 'Unknown'}
                  </span>
                </div>
                
                <div className="attribute">
                  <strong>Date:</strong>{' '}
                  <span 
                    className={`attribute-value ${isAttributeBanned('period', currentItem.objectDate) ? 'banned' : 'clickable'}`}
                    onClick={() => handleAttributeClick('period', currentItem.objectDate)}
                  >
                    {currentItem.objectDate || 'Unknown'}
                  </span>
                </div>
                
                <div className="attribute">
                  <strong>Culture:</strong>{' '}
                  <span 
                    className={`attribute-value ${isAttributeBanned('culture', currentItem.culture) ? 'banned' : 'clickable'}`}
                    onClick={() => handleAttributeClick('culture', currentItem.culture)}
                  >
                    {currentItem.culture || 'Unknown'}
                  </span>
                </div>
                
                <div className="attribute">
                  <strong>Department:</strong>{' '}
                  <span 
                    className={`attribute-value ${isAttributeBanned('department', currentItem.department) ? 'banned' : 'clickable'}`}
                    onClick={() => handleAttributeClick('department', currentItem.department)}
                  >
                    {currentItem.department || 'Unknown'}
                  </span>
                </div>
                
                <div className="attribute">
                  <strong>Medium:</strong>{' '}
                  <span className="attribute-value">
                    {currentItem.medium || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="side-panels">
        <div className="ban-list">
          <h3>🚫 Ban List</h3>
          {banList.length === 0 ? (
            <p className="empty-message">Click on attributes to ban them</p>
          ) : (
            <ul>
              {banList.map((item, index) => (
                <li 
                  key={index} 
                  className="ban-item clickable"
                  onClick={() => handleAttributeClick(item.type, item.value)}
                >
                  <span className="ban-type">{item.type}:</span> {item.value} 
                  <span className="remove">✕</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="history">
          <h3>📚 History ({history.length})</h3>
          {history.length === 0 ? (
            <p className="empty-message">No history yet</p>
          ) : (
            <div className="history-items">
              {history.map((item, index) => (
                <div 
                  key={index} 
                  className={`history-item ${currentItem?.objectID === item.objectID ? 'active' : ''}`}
                  onClick={() => loadItemFromHistory(item)}
                >
                  {item.primaryImage ? (
                    <img src={item.primaryImage} alt={item.title} />
                  ) : (
                    <div className="history-no-image">🖼️</div>
                  )}
                  <span className="history-title">
                    {item.title ? item.title.substring(0, 30) + (item.title.length > 30 ? '...' : '') : 'Untitled'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Venivici;