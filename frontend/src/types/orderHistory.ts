import { Office } from "./office";
import { Order } from "./order";

export interface OrderHistory {
    id: number;
    order: Order;
    fromOffice: Office;
    toOffice: Office;
    // shipment
    action: 'ReadyForPickup' |
          'PickedUp'|
          'Imported' |
          'Exported' |
          'Shipping' |
          'Delivered' |
          'Returned';
    note: string;
    actionTime: Date;
    createdAt: Date;
}

export interface Warehouse {
    incomingOrders: OrderHistory[];
    inWarehouseOrders: OrderHistory[];
    exportedOrders: OrderHistory[];
    incomingCount: number;
    inWarehouseCount: number;
    exportedCount: number;
}

export interface OrderHistoryResponse {
    success: boolean;
    message: string;
    warehouse: Warehouse;
}

export interface OrderHistoryState {
    loading: boolean;
    error: string | null;
    warehouse: Warehouse;
}