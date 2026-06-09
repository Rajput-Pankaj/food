import { z } from 'zod';

export const ROLES = ['customer', 'admin'];
export const BCRYPT_ROUNDS = 12;

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must include a letter.')
  .regex(/[0-9]/, 'Password must include a number.');

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email: z.string().trim().email('Invalid email address.'),
  password: passwordField,
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: passwordField,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required.'),
  password: passwordField,
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email: z.string().trim().email('Invalid email address.'),
  phone: z.string().trim().max(30).optional().default(''),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(1, 'Message is required.').max(5000),
});

export const razorpayVerifySchema = z.object({
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  amount: z.number().positive(),
});

export const promoValidateSchema = z.object({
  code: z.string().trim().min(2).max(30),
  subtotal: z.number().min(0).optional().default(0),
});

export const assignDriverSchema = z.object({
  driverId: z.string().uuid().nullable().optional(),
  driverName: z.string().trim().max(120).optional().default(''),
});

export const customerProfileSchema = z.object({
  phone: z.string().trim().max(30).optional().default(''),
  dietaryPreference: z.string().trim().max(50).nullable().optional(),
});

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1).max(60),
  address: z.string().trim().min(1).max(500),
  phone: z.string().trim().max(30).optional().default(''),
  pincode: z.string().trim().max(10).optional().default(''),
  isDefault: z.boolean().optional().default(false),
});

export const reviewSchema = z.object({
  id: z.string().uuid().optional(),
  foodId: z.union([z.number(), z.string()]),
  foodName: z.string().trim().min(1).max(200),
  rating: z.number().min(1).max(5),
  comment: z.string().trim().max(2000).optional().default(''),
});

export const blogPostSchema = z.object({
  id: z.string().min(1).max(100),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Invalid slug.'),
  title: z.string().trim().min(1).max(300),
  excerpt: z.string().trim().max(1000).optional().default(''),
  content: z.string().max(100000).optional().default(''),
  coverImage: z.string().max(500).optional().default(''),
  author: z.string().trim().max(120).optional().default(''),
  available: z.boolean().optional().default(true),
  tags: z.array(z.string().max(50)).optional().default([]),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'accepted',
    'preparing',
    'ready',
    'shipped',
    'delivered',
    'rejected',
    'cancelled',
  ]),
  note: z.string().trim().max(500).optional(),
});

export const promoCodeSchema = z.object({
  code: z.string().trim().min(2).max(30).toUpperCase(),
  discountType: z.enum(['percent', 'fixed', 'free_delivery']),
  discountValue: z.number().min(0),
  minOrder: z.number().min(0).optional().default(0),
  maxUses: z.number().int().min(0).optional().default(0),
  expiresAt: z.string().datetime().nullable().optional(),
  active: z.boolean().optional().default(true),
});

export const setupSchema = z.object({
  storeName: z.string().trim().min(1).max(120),
  storeAddress: z.string().trim().min(1).max(500),
  storePhone: z.string().trim().min(1).max(30),
  storeEmail: z
    .string()
    .trim()
    .optional()
    .transform((v) => v ?? '')
    .pipe(z.union([z.literal(''), z.string().email()])),
  adminName: z.string().trim().min(1).max(120),
  adminEmail: z.string().trim().email(),
  adminPassword: passwordField,
  loadSampleMenu: z.boolean().optional().default(true),
  setupToken: z.string().min(1).optional(),
});

export const orderTrackSchema = z.object({
  orderId: z.string().uuid('Invalid order ID.'),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional(),
}).refine((data) => Boolean(data.phone?.trim() || data.email?.trim()), {
  message: 'Phone or email is required to track a guest order.',
});

export const orderGuestFieldsSchema = z.object({
  guestName: z.string().trim().min(1).max(120),
  guestEmail: z.string().trim().email(),
  phone: z.string().trim().min(5).max(30),
  address: z.string().trim().max(500).optional().default(''),
});

export const menuItemSchema = z.object({
  id: z.number().int().positive().optional(),
  food_name: z.string().trim().min(1).max(200),
  food_category: z.string().trim().min(1).max(100),
  food_type: z.enum(['veg', 'non_veg']),
  price: z.number().min(0),
  food_image: z.string().max(500).optional().default(''),
  description: z.string().max(2000).optional().default(''),
  available: z.boolean().optional().default(true),
  stock: z.number().int().min(0).nullable().optional(),
  nutrition: z.record(z.unknown()).optional(),
  ingredients: z.string().max(2000).optional().default(''),
  allergens: z.string().max(500).optional().default(''),
});

export const userPatchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(['customer', 'admin']).optional(),
});

const upiSchema = z.object({
  vpa: z.string().max(100).optional().default(''),
  payeeName: z.string().max(120).optional().default(''),
});

const razorpaySettingsSchema = z.object({
  keyId: z.string().max(100).optional().default(''),
  enabled: z.boolean().optional().default(false),
});

const deliveryZoneSchema = z.object({
  name: z.string().trim().min(1).max(100),
  pincodes: z.array(z.string().trim().max(10)).min(1),
  deliveryFee: z.number().min(0),
  freeDeliveryThreshold: z.number().min(0).optional().default(0),
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(1).max(120).optional(),
  storeAddress: z.string().trim().max(500).optional(),
  storePhone: z.string().trim().max(30).optional(),
  storeEmail: z.string().trim().email().optional().or(z.literal('')),
  deliveryFee: z.number().min(0).optional(),
  freeDeliveryThreshold: z.number().min(0).optional(),
  deliveryEnabled: z.boolean().optional(),
  takeawayEnabled: z.boolean().optional(),
  enabledPaymentMethods: z.array(z.enum(['cod', 'upi', 'razorpay'])).optional(),
  upi: upiSchema.optional(),
  razorpay: razorpaySettingsSchema.optional(),
  deliveryZones: z.array(deliveryZoneSchema).optional(),
  guestCheckoutEnabled: z.boolean().optional(),
  storeLogo: z.string().max(500).optional().default(''),
  darkModeEnabled: z.boolean().optional(),
});

export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((e) => e.message).join(' ');
    return { ok: false, error: message };
  }
  return { ok: true, data: result.data };
}

export function sanitizePublicSettings(settings) {
  if (!settings || typeof settings !== 'object') return {};
  const { razorpay, ...rest } = settings;
  return {
    ...rest,
    razorpay: razorpay ? { keyId: razorpay.keyId || '', enabled: Boolean(razorpay.enabled) } : undefined,
  };
}
