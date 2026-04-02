// Centralized icons for the app

import {
  Add01Icon,
  Alert02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  ArrowUp01Icon,
  BalanceScaleIcon,
  Building03Icon,
  Calculator01Icon,
  Calendar03Icon,
  CancelCircleHalfDotIcon,
  CashIcon,
  Chart01Icon,
  CheckmarkCircle01Icon,
  CircleArrowReload01Icon,
  Clock01Icon,
  CoinsDollarIcon,
  Copy01Icon,
  Delete01Icon,
  DivideSignCircleIcon,
  Exchange01Icon,
  FileNotFoundIcon,
  FilePasteIcon,
  Home03Icon,
  HourglassIcon,
  InformationSquareIcon,
  Invoice02Icon,
  LockPasswordIcon,
  LogoutCircle02Icon,
  Mail01Icon,
  ManagerIcon,
  MoneyBag02Icon,
  MoreHorizontalCircle01Icon,
  PencilEdit01Icon,
  RecordIcon,
  Settings01Icon,
  ShieldUserIcon,
  SmartPhone01Icon,
  Store01Icon,
  StoreManagement01Icon,
  Task01Icon,
  TaskAdd01Icon,
  TaskRemove01Icon,
  UserAccountIcon,
  UserGroupIcon,
  UserIcon,
  UserMultipleIcon,
  UserStar01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export type IconKey = keyof typeof ICONS;

export const ICONS = {
  ACCOUNT_SETTINGS: Settings01Icon,
  ADD: Add01Icon,
  ADMIN: UserStar01Icon,
  ALERT: Alert02Icon,
  ARROW_LEFT: ArrowLeft01Icon,
  ARROW_RIGHT: ArrowRight01Icon,
  ARROW_DOWN: ArrowDown01Icon,
  ARROW_UP: ArrowUp01Icon,
  ARROW_TURN_BACKWARD: ArrowTurnBackwardIcon,
  ARROW_TURN_FORWARD: ArrowTurnForwardIcon,

  BUILDING: Building03Icon,

  CALCULATOR: Calculator01Icon,
  CALENDAR: Calendar03Icon,
  CANCEL_CIRCLE: CancelCircleHalfDotIcon,
  CASH_DIFFERENCE: BalanceScaleIcon,
  CASHFLOW: Chart01Icon,
  CASH_OUT: CashIcon,
  CHECKMARK_CIRCLE: CheckmarkCircle01Icon,
  CIRCLE_ARROW_RELOAD: CircleArrowReload01Icon,
  COPY: Copy01Icon,

  DELETE: Delete01Icon,
  DOT: RecordIcon,

  EDIT: PencilEdit01Icon,
  EXPENSE: Invoice02Icon,
  EXCHANGE: Exchange01Icon,

  FILE_PASTE: FilePasteIcon,
  FILE_NOT_FOUND: FileNotFoundIcon,

  HOME: Home03Icon,
  HOURGLASS: HourglassIcon,

  INFORMATION: InformationSquareIcon,

  LOCK_PASSWORD: LockPasswordIcon,
  LOGOUT: LogoutCircle02Icon,

  MAIL: Mail01Icon,
  MORE_HORIZONTAL: MoreHorizontalCircle01Icon,

  OPERATOR: ManagerIcon,

  PER_HOUR: DivideSignCircleIcon,

  REPORT: Task01Icon,
  REPORT_ADD: TaskAdd01Icon,
  REPORT_NOT_FOUND: TaskRemove01Icon,

  SALES_IN_STORE: Store01Icon,
  SALES_ONLINE: SmartPhone01Icon,
  SALES_TOTAL: MoneyBag02Icon,
  SHIELD: ShieldUserIcon,
  STORE_SETTINGS: StoreManagement01Icon,

  TOTAL_TIPS: CoinsDollarIcon,
  TOTAL_HOURS: Clock01Icon,

  USER: UserIcon,
  USER_ACCOUNT: UserAccountIcon,
  USER_TWO: UserMultipleIcon,
  USER_GROUP: UserGroupIcon,
} as const satisfies Record<string, IconSvgElement>;
