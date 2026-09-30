import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const departments = sqliteTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employees = sqliteTable(
  "employees",
  {
    id: text("id").primaryKey(),
    nik: text("nik", { length: 16 }).notNull().unique(),
    noKk: text("no_kk", { length: 16 }),
    fullName: text("full_name").notNull(),
    gender: text("gender", { enum: ["LAKI-LAKI", "PEREMPUAN"] }).notNull(),
    birthPlace: text("birth_place"),
    birthDate: text("birth_date").notNull(), // ISO 8601 YYYY-MM-DD
    address: text("address"),
    religion: text("religion"),
    maritalStatus: text("marital_status"),
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "restrict" }),
    position: text("position").notNull(),
    employmentStatus: text("employment_status", {
      enum: ["TETAP", "KONTRAK", "HARIAN", "MAGANG"],
    }).notNull(),
    joinDate: text("join_date").notNull(), // YYYY-MM-DD
    endContractDate: text("end_contract_date"), // YYYY-MM-DD, nullable
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    ktpImageBase64OrUrl: text("ktp_image_url"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    nikIdx: uniqueIndex("employees_nik_idx").on(table.nik),
    isActiveIdx: index("employees_is_active_idx").on(table.isActive),
    departmentIdx: index("employees_department_idx").on(table.departmentId),
    employmentStatusIdx: index("employees_status_idx").on(table.employmentStatus),
  })
);

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
