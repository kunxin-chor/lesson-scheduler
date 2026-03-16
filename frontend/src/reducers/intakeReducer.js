export const INTAKE_ACTIONS = {
  // Intake management
  SET_INTAKES: 'SET_INTAKES',
  CREATE_INTAKE: 'CREATE_INTAKE',
  UPDATE_INTAKE: 'UPDATE_INTAKE',
  DELETE_INTAKE: 'DELETE_INTAKE',
  
  // Selection
  SELECT_INTAKE: 'SELECT_INTAKE',
  DESELECT_INTAKE: 'DESELECT_INTAKE',
  
  // UI state
  TOGGLE_CREATE_FORM: 'TOGGLE_CREATE_FORM',
  TOGGLE_SLOT_MANAGER: 'TOGGLE_SLOT_MANAGER',
  TOGGLE_REGENERATE_MODAL: 'TOGGLE_REGENERATE_MODAL',
  
  // Loading and error states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  
  // Lesson plans
  SET_LESSON_PLANS: 'SET_LESSON_PLANS',
}

export const initialState = {
  intakes: [],
  lessonPlans: [],
  selectedIntake: null,
  showCreateForm: false,
  showSlotManager: false,
  showRegenerateModal: false,
  loading: false,
  error: null,
}

export function intakeReducer(state, action) {
  switch (action.type) {
    case INTAKE_ACTIONS.SET_INTAKES:
      return {
        ...state,
        intakes: action.payload,
      }

    case INTAKE_ACTIONS.CREATE_INTAKE:
      return {
        ...state,
        intakes: [...state.intakes, action.payload],
        showCreateForm: false,
      }

    case INTAKE_ACTIONS.UPDATE_INTAKE: {
      const updatedIntake = action.payload
      return {
        ...state,
        intakes: state.intakes.map(i =>
          i.id === updatedIntake.id ? updatedIntake : i
        ),
        selectedIntake: state.selectedIntake?.id === updatedIntake.id 
          ? updatedIntake 
          : state.selectedIntake,
      }
    }

    case INTAKE_ACTIONS.DELETE_INTAKE: {
      const intakeId = action.payload
      return {
        ...state,
        intakes: state.intakes.filter(i => i.id !== intakeId),
        selectedIntake: state.selectedIntake?.id === intakeId 
          ? null 
          : state.selectedIntake,
      }
    }

    case INTAKE_ACTIONS.SELECT_INTAKE:
      return {
        ...state,
        selectedIntake: action.payload,
      }

    case INTAKE_ACTIONS.DESELECT_INTAKE:
      return {
        ...state,
        selectedIntake: null,
      }

    case INTAKE_ACTIONS.TOGGLE_CREATE_FORM:
      return {
        ...state,
        showCreateForm: action.payload ?? !state.showCreateForm,
      }

    case INTAKE_ACTIONS.TOGGLE_SLOT_MANAGER:
      return {
        ...state,
        showSlotManager: action.payload ?? !state.showSlotManager,
      }

    case INTAKE_ACTIONS.TOGGLE_REGENERATE_MODAL:
      return {
        ...state,
        showRegenerateModal: action.payload ?? !state.showRegenerateModal,
      }

    case INTAKE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }

    case INTAKE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      }

    case INTAKE_ACTIONS.SET_LESSON_PLANS:
      return {
        ...state,
        lessonPlans: action.payload,
      }

    default:
      return state
  }
}
