import React, { useState, useEffect } from 'react';
import '../App.css'; // Import consistent project-wide styling

const CashierPage = () => {
    const [menu, setMenu] = useState([]); // Stores info from db on menu items
    const [order, setOrder] = useState([]); // Stores current order information
    const [total, setTotal] = useState(0); // Stores info on price of order

    useEffect(() => { //loads menu items on page launch 
	fetch('http://localhost:8080/api/menu')
		.then(res => {
			if(!res.ok) throw new Error("Network could not be communicated with");
			return res.json();
		})
		.then(data => setMenu(data))
		.catch(err => console.error("Error fetching menu:", err));
    }, []);

    const addToOrder = (item) => {
	setOrder([...order, item]);
        setTotal(prev => prev + parseFloat(item.base_price)); 
    };

    const submitOrder = async () => {
        const orderData = {
		customer_id: 1, //Placeholder will be expanded upon
                employee_id: 1, // Placeholder will be expanded upon
                total_amount: total,
                items: order.map(item => ({ 
			menu_item_id: item.menu_item_id,
                        quantity: 1,
                        price: item.base_price
		}))
        };

        try{
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if(response.ok) {
                alert("Order Placed Successfully!");
               
		setOrder([]); //clear current stored order 
                setTotal(0);  //reset the current stored order total
            }
        } catch (err) {
            console.error("Error submitting order:", err);
        }
    };

    return(
	<div id="center">
		<div className="hero">
			<h1 style={{ color: 'var(--text-h)' }}>Cashier Interface</h1>
                        <div className="ticks"></div>
                </div>

                <div id="next-steps" style={{ width: '100%', maxWidth: '1200px' }}>
                        <div id="docs">
                                <h2 className="icon" style={{ width: 'auto' }}>Drink Menu</h2>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                                         {menu?.map(item => (
					<button 
                                                 key={item.menu_item_id} 
                                                 className="counter" 
                                                 onClick={() => addToOrder(item)}
                                                 style={{ margin: 0, cursor: 'pointer', textAlign: 'center' }}
                                                >
                                                {item.name}<br/>
                                                <small>${item.base_price}</small>
                                        </button>
				))}
                               </div>
			</div>

                <div>
                    <h2>Current Order</h2>
                    <div style={{ minHeight: '200px', background: 'var(--social-bg)', borderRadius: '8px', padding: '16px', marginTop: '16px', marginTop: '16px' }}>
				{order.length === 0 ? <p>Order is empty</p> : (
				<ul style={{ listStyle: 'none', padding: 0 }}>
                                {order.map((item, idx) => (
                                    <li key={idx} style={{ padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                                        {item.name} - ${item.base_price}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Total: ${total.toFixed(2)}</h3>
                        <ul style={{ marginTop: 0 }}>
                            <li style={{ flex: 1 }}>
                                <a href="#" onClick={(e) => { e.preventDefault(); submitOrder(); }} 
                                   className="counter"
                                   style={{ 
                                       background: 'var(--accent)', 
                                       color: '#000', 
                                       fontWeight: 'bold', 
                                       display: 'block', 
                                       textAlign: 'center', 
                                       textDecoration: 'none' 
                                   }}>
                                    SUBMIT ORDER
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div id="spacer"></div>
        </div>
    );
};

export default CashierPage;
