import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

interface NotificationsState {
  items: NotificationItem[];
}

const initialState: NotificationsState = {
  items: [
    {
      id: 'welcome-notification',
      title: 'Welcome to Ashiyana ERP',
      message: 'System loaded successfully. You can manage inventory, staff, sales, and settings.',
      type: 'info',
      timestamp: new Date().toISOString(),
      isRead: false,
    },
  ],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>>
    ) => {
      const newNotification: NotificationItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        isRead: false,
        ...action.payload,
      };
      // Insert at the beginning of the list (newest first)
      state.items.unshift(newNotification);
      // Cap the list size at 50 items
      if (state.items.length > 50) {
        state.items.pop();
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) {
        item.isRead = true;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.isRead = true;
      });
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearNotifications } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
