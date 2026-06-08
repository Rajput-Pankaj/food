import {
  MdDashboard,
  MdLocationOn,
  MdPerson,
  MdReceiptLong,
  MdStar,
} from 'react-icons/md';

export { ORDER_STATUS_COLORS } from './orders';

export const CUSTOMER_DASHBOARD_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Home',
    icon: MdDashboard,
    description: 'Summary & quick actions',
  },
  {
    id: 'orders',
    label: 'Orders',
    shortLabel: 'Orders',
    icon: MdReceiptLong,
    description: 'Track & repeat orders',
  },
  {
    id: 'profile',
    label: 'Profile',
    shortLabel: 'Profile',
    icon: MdPerson,
    description: 'Name, phone & diet prefs',
  },
  {
    id: 'addresses',
    label: 'Addresses',
    shortLabel: 'Address',
    icon: MdLocationOn,
    description: 'Delivery locations',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    shortLabel: 'Reviews',
    icon: MdStar,
    description: 'Your food ratings',
  },
];

export const VALID_CUSTOMER_TABS = new Set(
  CUSTOMER_DASHBOARD_TABS.map((tab) => tab.id)
);
