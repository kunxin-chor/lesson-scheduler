// Action types
export const LESSON_PLAN_ACTIONS = {
  // Lesson Plan CRUD
  SET_LESSON_PLANS: 'SET_LESSON_PLANS',
  CREATE_LESSON_PLAN: 'CREATE_LESSON_PLAN',
  UPDATE_LESSON_PLAN: 'UPDATE_LESSON_PLAN',
  DELETE_LESSON_PLAN: 'DELETE_LESSON_PLAN',
  DUPLICATE_LESSON_PLAN: 'DUPLICATE_LESSON_PLAN',
  
  // Selection
  SELECT_LESSON_PLAN: 'SELECT_LESSON_PLAN',
  DESELECT_LESSON_PLAN: 'DESELECT_LESSON_PLAN',
  
  // Modules
  SET_MODULES: 'SET_MODULES',
  UPDATE_MODULES: 'UPDATE_MODULES',
  
  // Lessons
  SET_LESSONS: 'SET_LESSONS',
  UPDATE_LESSONS: 'UPDATE_LESSONS',
  
  // UI State
  TOGGLE_CREATE_FORM: 'TOGGLE_CREATE_FORM',
  SET_SAVE_STATUS: 'SET_SAVE_STATUS',
  SET_LAST_SAVED: 'SET_LAST_SAVED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
}

// Initial state
export const initialState = {
  lessonPlans: [],
  selectedPlan: null,
  modules: [],
  lessons: [],
  showCreateForm: false,
  saveStatus: 'saved', // 'saved', 'saving', 'unsaved'
  lastSaved: null,
  loading: false,
  error: null,
}

// Reducer function
export function lessonPlanReducer(state, action) {
  switch (action.type) {
    case LESSON_PLAN_ACTIONS.SET_LESSON_PLANS:
      return {
        ...state,
        lessonPlans: action.payload,
      }

    case LESSON_PLAN_ACTIONS.CREATE_LESSON_PLAN: {
      const newPlan = {
        id: `plan-${Date.now()}`,
        name: action.payload.name,
        description: action.payload.description,
        modules: [],
        lessons: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return {
        ...state,
        lessonPlans: [...state.lessonPlans, newPlan],
        showCreateForm: false,
      }
    }

    case LESSON_PLAN_ACTIONS.UPDATE_LESSON_PLAN: {
      const updatedPlan = {
        ...state.selectedPlan,
        ...action.payload,
        modules: state.modules,
        lessons: state.lessons,
        updatedAt: new Date(),
      }
      return {
        ...state,
        lessonPlans: state.lessonPlans.map(p =>
          p.id === state.selectedPlan.id ? updatedPlan : p
        ),
        selectedPlan: updatedPlan,
      }
    }

    case LESSON_PLAN_ACTIONS.DELETE_LESSON_PLAN: {
      const planId = action.payload
      return {
        ...state,
        lessonPlans: state.lessonPlans.filter(p => p.id !== planId),
        selectedPlan: state.selectedPlan?.id === planId ? null : state.selectedPlan,
        modules: state.selectedPlan?.id === planId ? [] : state.modules,
        lessons: state.selectedPlan?.id === planId ? [] : state.lessons,
      }
    }

    case LESSON_PLAN_ACTIONS.DUPLICATE_LESSON_PLAN: {
      const plan = action.payload
      const duplicatedPlan = {
        ...plan,
        id: `plan-${Date.now()}`,
        name: `${plan.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return {
        ...state,
        lessonPlans: [...state.lessonPlans, duplicatedPlan],
      }
    }

    case LESSON_PLAN_ACTIONS.SELECT_LESSON_PLAN: {
      const plan = action.payload
      return {
        ...state,
        selectedPlan: plan,
        modules: plan.modules || [],
        lessons: plan.lessons || [],
      }
    }

    case LESSON_PLAN_ACTIONS.DESELECT_LESSON_PLAN:
      return {
        ...state,
        selectedPlan: null,
        modules: [],
        lessons: [],
      }

    case LESSON_PLAN_ACTIONS.SET_MODULES:
      return {
        ...state,
        modules: action.payload,
      }

    case LESSON_PLAN_ACTIONS.UPDATE_MODULES:
      return {
        ...state,
        modules: action.payload,
      }

    case LESSON_PLAN_ACTIONS.SET_LESSONS:
      return {
        ...state,
        lessons: action.payload,
      }

    case LESSON_PLAN_ACTIONS.UPDATE_LESSONS:
      return {
        ...state,
        lessons: action.payload,
      }

    case LESSON_PLAN_ACTIONS.TOGGLE_CREATE_FORM:
      return {
        ...state,
        showCreateForm: action.payload ?? !state.showCreateForm,
      }

    case LESSON_PLAN_ACTIONS.SET_SAVE_STATUS:
      return {
        ...state,
        saveStatus: action.payload,
      }

    case LESSON_PLAN_ACTIONS.SET_LAST_SAVED:
      return {
        ...state,
        lastSaved: action.payload,
      }

    case LESSON_PLAN_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }

    case LESSON_PLAN_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      }

    default:
      return state
  }
}
