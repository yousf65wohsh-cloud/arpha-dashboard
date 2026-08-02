/**
 * Repositories barrel — import from `@/repositories`.
 * Each repo accepts an isomorphic Supabase client (`Db`) so the same code
 * serves browser hooks, server components and future route handlers/BFF.
 */
export { ensureStoreId, guard, type Db } from "@/repositories/base";
export { authRepository } from "@/repositories/auth.repository";
export { storeRepository, planRepository } from "@/repositories/store.repository";
export { conversationRepository } from "@/repositories/conversation.repository";
export { orderRepository, ORDER_STATUSES } from "@/repositories/order.repository";
export { customerRepository } from "@/repositories/customer.repository";
export { productRepository, type ProductInput, type ProductFilters } from "@/repositories/product.repository";
export { serviceRepository, type ServiceInput } from "@/repositories/service.repository";
export { policyRepository, type PolicyInput } from "@/repositories/policy.repository";
export { followupRepository } from "@/repositories/followup.repository";
export { usageRepository, type UsageFilters } from "@/repositories/usage.repository";
export { reportRepository, type ReportFilters } from "@/repositories/report.repository";
