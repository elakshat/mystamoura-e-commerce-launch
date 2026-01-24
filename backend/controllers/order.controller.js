/**
 * Order Controller
 * Handles order operations
 */

const supabase = require('../config/supabase.config');

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MYS-${dateStr}-${random}`;
};

/**
 * Create a new order
 * POST /api/orders/create
 */
exports.createOrder = async (req, res, next) => {
  try {
    const {
      user_id,
      guest_email,
      items,
      subtotal,
      shipping_amount,
      tax_amount,
      discount_amount,
      total,
      shipping_address,
      payment_method,
      coupon_id,
      notes
    } = req.body;

    const orderNumber = generateOrderNumber();

    // If Supabase is configured, save to database
    if (supabase) {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user_id || null,
          guest_email: guest_email || null,
          status: 'pending',
          payment_status: 'pending',
          payment_method,
          subtotal,
          shipping_amount: shipping_amount || 0,
          tax_amount: tax_amount || 0,
          discount_amount: discount_amount || 0,
          total,
          shipping_address,
          coupon_id: coupon_id || null,
          notes: notes || null
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Order creation error:', orderError);
        throw new Error('Failed to create order in database');
      }

      // Create order items
      if (items && items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image || null,
          variant_id: item.variant_id || null,
          variant_size: item.variant_size || null,
          variant_sku: item.variant_sku || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('❌ Order items error:', itemsError);
        }
      }

      console.log(`✅ Order created: ${orderNumber}`);

      res.status(201).json({
        success: true,
        order_number: orderNumber,
        order_id: order.id,
        message: 'Order created successfully'
      });

    } else {
      // No database - just return the order number
      console.log(`✅ Order number generated: ${orderNumber} (no database)`);
      
      res.status(201).json({
        success: true,
        order_number: orderNumber,
        message: 'Order created successfully'
      });
    }

  } catch (error) {
    console.error('❌ Create order error:', error);
    next(error);
  }
};

/**
 * Get order by order number
 * GET /api/orders/:orderNumber
 */
exports.getOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('❌ Get order error:', error);
    next(error);
  }
};

/**
 * Update order status
 * PUT /api/orders/:orderNumber/status
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { status, payment_status, payment_id } = req.body;

    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    if (payment_id) updateData.payment_id = payment_id;

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('order_number', orderNumber)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update order'
      });
    }

    console.log(`✅ Order ${orderNumber} updated`);

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: data
    });

  } catch (error) {
    console.error('❌ Update order error:', error);
    next(error);
  }
};
