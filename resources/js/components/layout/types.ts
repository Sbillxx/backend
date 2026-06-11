import { LinkProps } from '@tanstack/react-router'

interface User {
  name: string
  email: string
  avatar: string
  role: 'admin' | 'user'
  team: string
}

interface Team {
  name: string
  logo: React.ElementType
  plan: string
  id: number
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
  adminOnly?: boolean
}

type NavLink = BaseNavItem & {
  url: LinkProps['to']
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to']; adminOnly?: boolean })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
  title: string
  items: NavItem[]
}

interface SidebarData {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
  active_team?: Team | null
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink, User, Team }
