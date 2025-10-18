import { create } from "zustand";

export interface CVPersonalInfo {
	fullName: string;
	title: string;
	email: string;
	phone: string;
	location: string;
	summary: string;
	website: string;
	linkedin: string;
	github: string;
	portfolio: string;
	photo: string;
}

export interface CVExperience {
	id: string;
	title: string;
	company: string;
	location: string;
	startDate: string;
	endDate: string;
	current: boolean;
	description: string;
	highlights: string[];
	order: number;
}

export interface CVEducation {
	id: string;
	degree: string;
	institution: string;
	location: string;
	startDate: string;
	endDate: string;
	gpa: string;
	description: string;
	order: number;
}

export interface CVSkill {
	id: string;
	category: string;
	items: string[];
	level: "beginner" | "intermediate" | "advanced" | "expert";
	order: number;
}

export interface CVLanguage {
	id: string;
	language: string;
	proficiency: "basic" | "conversational" | "professional" | "native";
	order: number;
}

export interface CVCertification {
	id: string;
	name: string;
	issuer: string;
	date: string;
	url: string;
	order: number;
}

export interface CVProject {
	id: string;
	name: string;
	description: string;
	technologies: string[];
	url: string;
	github: string;
	order: number;
}

export interface CVAward {
	id: string;
	title: string;
	issuer: string;
	date: string;
	description: string;
	order: number;
}

export interface CVData {
	personalInfo: CVPersonalInfo;
	experience: CVExperience[];
	education: CVEducation[];
	skills: CVSkill[];
	languages: CVLanguage[];
	certifications: CVCertification[];
	projects: CVProject[];
	awards: CVAward[];
}

export interface CVSettings {
	template: "modern" | "classic" | "minimal" | "creative" | "professional";
	colorScheme: string;
	fontSize: "small" | "medium" | "large";
	spacing: "compact" | "normal" | "relaxed";
	showPhoto: boolean;
	sectionOrder: string[];
}

interface CVStore {
	cvData: CVData;
	settings: CVSettings;
	history: CVData[];
	historyIndex: number;
	
	// Actions
	updatePersonalInfo: (info: Partial<CVPersonalInfo>) => void;
	addExperience: (exp: Omit<CVExperience, "id" | "order">) => void;
	updateExperience: (id: string, exp: Partial<CVExperience>) => void;
	removeExperience: (id: string) => void;
	reorderExperience: (items: CVExperience[]) => void;
	
	addEducation: (edu: Omit<CVEducation, "id" | "order">) => void;
	updateEducation: (id: string, edu: Partial<CVEducation>) => void;
	removeEducation: (id: string) => void;
	reorderEducation: (items: CVEducation[]) => void;
	
	addSkill: (skill: Omit<CVSkill, "id" | "order">) => void;
	updateSkill: (id: string, skill: Partial<CVSkill>) => void;
	removeSkill: (id: string) => void;
	
	addLanguage: (lang: Omit<CVLanguage, "id" | "order">) => void;
	updateLanguage: (id: string, lang: Partial<CVLanguage>) => void;
	removeLanguage: (id: string) => void;
	
	addCertification: (cert: Omit<CVCertification, "id" | "order">) => void;
	updateCertification: (id: string, cert: Partial<CVCertification>) => void;
	removeCertification: (id: string) => void;
	
	addProject: (proj: Omit<CVProject, "id" | "order">) => void;
	updateProject: (id: string, proj: Partial<CVProject>) => void;
	removeProject: (id: string) => void;
	
	addAward: (award: Omit<CVAward, "id" | "order">) => void;
	updateAward: (id: string, award: Partial<CVAward>) => void;
	removeAward: (id: string) => void;
	
	updateSettings: (settings: Partial<CVSettings>) => void;
	importData: (data: Partial<CVData>) => void;
	resetCV: () => void;
	
	undo: () => void;
	redo: () => void;
	canUndo: () => boolean;
	canRedo: () => boolean;
}

const initialCVData: CVData = {
	personalInfo: {
		fullName: "",
		title: "",
		email: "",
		phone: "",
		location: "",
		summary: "",
		website: "",
		linkedin: "",
		github: "",
		portfolio: "",
		photo: "",
	},
	experience: [],
	education: [],
	skills: [],
	languages: [],
	certifications: [],
	projects: [],
	awards: [],
};

const initialSettings: CVSettings = {
	template: "modern",
	colorScheme: "#3b82f6",
	fontSize: "medium",
	spacing: "normal",
	showPhoto: true,
	sectionOrder: [
		"experience",
		"education",
		"skills",
		"projects",
		"certifications",
		"languages",
		"awards",
	],
};

export const useCVStore = create<CVStore>((set, get) => ({
	cvData: initialCVData,
	settings: initialSettings,
	history: [initialCVData],
	historyIndex: 0,

	updatePersonalInfo: (info) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				personalInfo: { ...state.cvData.personalInfo, ...info },
			},
		})),

	addExperience: (exp) =>
		set((state) => {
			const newExp: CVExperience = {
				...exp,
				id: Date.now().toString(),
				order: state.cvData.experience.length,
			};
			return {
				cvData: {
					...state.cvData,
					experience: [...state.cvData.experience, newExp],
				},
			};
		}),

	updateExperience: (id, exp) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				experience: state.cvData.experience.map((e) =>
					e.id === id ? { ...e, ...exp } : e
				),
			},
		})),

	removeExperience: (id) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				experience: state.cvData.experience.filter((e) => e.id !== id),
			},
		})),

	reorderExperience: (items) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				experience: items.map((item, index) => ({ ...item, order: index })),
			},
		})),

	addEducation: (edu) =>
		set((state) => {
			const newEdu: CVEducation = {
				...edu,
				id: Date.now().toString(),
				order: state.cvData.education.length,
			};
			return {
				cvData: {
					...state.cvData,
					education: [...state.cvData.education, newEdu],
				},
			};
		}),

	updateEducation: (id, edu) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				education: state.cvData.education.map((e) =>
					e.id === id ? { ...e, ...edu } : e
				),
			},
		})),

	removeEducation: (id) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				education: state.cvData.education.filter((e) => e.id !== id),
			},
		})),

	reorderEducation: (items) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				education: items.map((item, index) => ({ ...item, order: index })),
			},
		})),

	addSkill: (skill) =>
		set((state) => {
			const newSkill: CVSkill = {
				...skill,
				id: Date.now().toString(),
				order: state.cvData.skills.length,
			};
			return {
				cvData: {
					...state.cvData,
					skills: [...state.cvData.skills, newSkill],
				},
			};
		}),

	updateSkill: (id, skill) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				skills: state.cvData.skills.map((s) =>
					s.id === id ? { ...s, ...skill } : s
				),
			},
		})),

	removeSkill: (id) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				skills: state.cvData.skills.filter((s) => s.id !== id),
			},
		})),

	addLanguage: (lang) =>
		set((state) => {
			const newLang: CVLanguage = {
				...lang,
				id: Date.now().toString(),
				order: state.cvData.languages.length,
			};
			return {
				cvData: {
					...state.cvData,
					languages: [...state.cvData.languages, newLang],
				},
			};
		}),

	updateLanguage: (id, lang) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				languages: state.cvData.languages.map((l) =>
					l.id === id ? { ...l, ...lang } : l
				),
			},
		})),

	removeLanguage: (id) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				languages: state.cvData.languages.filter((l) => l.id !== id),
			},
		})),

	addCertification: (cert) =>
		set((state) => {
			const newCert: CVCertification = {
				...cert,
				id: Date.now().toString(),
				order: state.cvData.certifications.length,
			};
			return {
				cvData: {
					...state.cvData,
					certifications: [...state.cvData.certifications, newCert],
				},
			};
		}),

	updateCertification: (id, cert) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				certifications: state.cvData.certifications.map((c) =>
					c.id === id ? { ...c, ...cert } : c
				),
			},
		})),

	removeCertification: (id) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				certifications: state.cvData.certifications.filter((c) => c.id !== id),
			},
		})),

	addProject: (proj) =>
		set((state) => {
			const newProj: CVProject = {
				...proj,
				id: Date.now().toString(),
				order: state.cvData.projects.length,
			};
			return {
				cvData: {
					...state.cvData,
					projects: [...state.cvData.projects, newProj],
				},
			};
		}),

	updateProject: (id, proj) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				projects: state.cvData.projects.map((p) =>
					p.id === id ? { ...p, ...proj } : p
				),
			},
		})),

	removeProject: (id) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				projects: state.cvData.projects.filter((p) => p.id !== id),
			},
		})),

	addAward: (award) =>
		set((state) => {
			const newAward: CVAward = {
				...award,
				id: Date.now().toString(),
				order: state.cvData.awards.length,
			};
			return {
				cvData: {
					...state.cvData,
					awards: [...state.cvData.awards, newAward],
				},
			};
		}),

	updateAward: (id, award) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				awards: state.cvData.awards.map((a) =>
					a.id === id ? { ...a, ...award } : a
				),
			},
		})),

	removeAward: (id) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				awards: state.cvData.awards.filter((a) => a.id !== id),
			},
		})),

	updateSettings: (settings) =>
		set((state) => ({
			settings: { ...state.settings, ...settings },
		})),

	importData: (data) =>
		set((state) => ({
			cvData: {
				...state.cvData,
				...data,
				personalInfo: { ...state.cvData.personalInfo, ...data.personalInfo },
			},
		})),

	resetCV: () =>
		set({
			cvData: initialCVData,
			settings: initialSettings,
			history: [initialCVData],
			historyIndex: 0,
		}),

	undo: () =>
		set((state) => {
			if (state.historyIndex > 0) {
				return {
					historyIndex: state.historyIndex - 1,
					cvData: state.history[state.historyIndex - 1],
				};
			}
			return state;
		}),

	redo: () =>
		set((state) => {
			if (state.historyIndex < state.history.length - 1) {
				return {
					historyIndex: state.historyIndex + 1,
					cvData: state.history[state.historyIndex + 1],
				};
			}
			return state;
		}),

	canUndo: () => get().historyIndex > 0,
	canRedo: () => get().historyIndex < get().history.length - 1,
}));
