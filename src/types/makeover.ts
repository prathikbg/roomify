export type RoomType = 'bedroom' | 'living-room' | 'kitchen' | 'bathroom' | 'home-office' | 'dining-room' | 'entryway' | 'balcony' | 'kids-room' | 'pooja-room' | 'wardrobe' | 'guest-room';

export type DesignStyle = 'modern' | 'scandinavian' | 'japandi' | 'luxury' | 'boho' | 'industrial' | 'traditional-indian' | 'smart-home';

export type BudgetRange = 'under-10k' | '10k-25k' | '25k-50k' | '50k-100k' | 'above-100k';

export interface WorkflowStep {
  id: number;
  label: string;
}

export interface FurnitureItem {
  name: string;
  price: number;
  affiliateLink: string;
  image?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface DetectedItem {
  name: string;
  matchedProduct: FurnitureItem;
}

export interface MakeoverState {
  currentStep: number;
  uploadedImage: string | null;
  roomType: RoomType | null;
  designStyle: DesignStyle | null;
  budgetRange: BudgetRange | null;
  generatedImage: string | null;
  isGenerating: boolean;
  detectedItems: DetectedItem[];
  colorPalette: ColorSwatch[];
  pinterestImage: string | null;
}

export type MakeoverAction =
  | { type: 'SET_IMAGE'; payload: string }
  | { type: 'SET_ROOM_TYPE'; payload: RoomType }
  | { type: 'SET_DESIGN_STYLE'; payload: DesignStyle }
  | { type: 'SET_BUDGET'; payload: BudgetRange }
  | { type: 'SET_GENERATED_IMAGE'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: { detectedItems: DetectedItem[]; colorPalette: ColorSwatch[]; pinterestImage: string } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };

export const initialState: MakeoverState = {
  currentStep: 1,
  uploadedImage: null,
  roomType: null,
  designStyle: null,
  budgetRange: null,
  generatedImage: null,
  isGenerating: false,
  detectedItems: [],
  colorPalette: [],
  pinterestImage: null,
};

export function makeoverReducer(state: MakeoverState, action: MakeoverAction): MakeoverState {
  switch (action.type) {
    case 'SET_IMAGE':
      return { ...state, uploadedImage: action.payload };
    case 'SET_ROOM_TYPE':
      return { ...state, roomType: action.payload };
    case 'SET_DESIGN_STYLE':
      return { ...state, designStyle: action.payload };
    case 'SET_BUDGET':
      return { ...state, budgetRange: action.payload };
    case 'SET_GENERATED_IMAGE':
      return { ...state, generatedImage: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_RESULTS':
      return {
        ...state,
        detectedItems: action.payload.detectedItems,
        colorPalette: action.payload.colorPalette,
        pinterestImage: action.payload.pinterestImage,
      };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 5) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
