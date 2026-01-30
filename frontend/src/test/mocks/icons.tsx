// Mock component for Material-UI icons
// This prevents EMFILE errors on Windows by avoiding opening hundreds of icon files
const MockIcon = ({ children, "data-testid": testId, ...props }: any) => (
  <span data-testid={testId || "mui-icon"} {...props}>
    {children}
  </span>
);

// Create a Proxy to catch any icon that's not explicitly listed
// This ensures all icon imports work without needing to list every single one
const createIconProxy = () => {
  return new Proxy({} as Record<string, typeof MockIcon>, {
    get: (_target, _prop: string) => {
      // Return MockIcon for any property access
      return MockIcon;
    },
  });
};

// Explicitly export commonly used icons for better type safety and clarity
export const CheckCircle = MockIcon;
export const Delete = MockIcon;
export const RadioButtonUnchecked = MockIcon;
export const SubdirectoryArrowRight = MockIcon;
export const AddTask = MockIcon;
export const Refresh = MockIcon;
export const Settings = MockIcon;
export const SettingsInputComponent = MockIcon;
export const SettingsInputComponentRounded = MockIcon;
export const SettingsInputComponentOutlined = MockIcon;
export const SettingsInputComponentSharp = MockIcon;
export const Add = MockIcon;
export const Edit = MockIcon;
export const Close = MockIcon;
export const ExpandMore = MockIcon;
export const ChevronRight = MockIcon;
export const Attachment = MockIcon;
export const AttachFile = MockIcon;
export const Download = MockIcon;
export const Upload = MockIcon;
export const Visibility = MockIcon;
export const VisibilityOff = MockIcon;
export const Search = MockIcon;
export const FilterList = MockIcon;
export const MoreVert = MockIcon;
export const Menu = MockIcon;
export const Home = MockIcon;
export const Person = MockIcon;
export const Logout = MockIcon;
export const Login = MockIcon;
export const Lock = MockIcon;
export const Email = MockIcon;
export const PersonAdd = MockIcon;
export const AccessTime = MockIcon;
export const CalendarToday = MockIcon;
export const Description = MockIcon;
export const Link = MockIcon;
export const Clear = MockIcon;
export const ZoomIn = MockIcon;
export const ZoomOut = MockIcon;
export const Fullscreen = MockIcon;
export const FullscreenExit = MockIcon;

// Create a proxy that handles any icon not explicitly listed
// This is used as a fallback for dynamic imports
const iconProxy = createIconProxy();

// Export default as the proxy merged with explicit exports
// This ensures both named imports and any missing icons work
export default Object.assign(iconProxy, {
  CheckCircle,
  Delete,
  RadioButtonUnchecked,
  SubdirectoryArrowRight,
  AddTask,
  Refresh,
  Settings,
  SettingsInputComponent,
  SettingsInputComponentRounded,
  SettingsInputComponentOutlined,
  SettingsInputComponentSharp,
  Add,
  Edit,
  Close,
  ExpandMore,
  ChevronRight,
  Attachment,
  AttachFile,
  Download,
  Upload,
  Visibility,
  VisibilityOff,
  Search,
  FilterList,
  MoreVert,
  Menu,
  Home,
  Person,
  Logout,
  Login,
  Lock,
  Email,
  PersonAdd,
  AccessTime,
  CalendarToday,
  Description,
  Link,
  Clear,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
});
