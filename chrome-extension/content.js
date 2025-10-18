// Content script that runs on LinkedIn profile pages
// Extracts profile data from the currently viewed LinkedIn profile

console.log('JobPrep LinkedIn Scraper - Content script loaded');

// Function to click all "Show all X" buttons to expand sections
async function expandAllSections() {
  console.log('Expanding all LinkedIn sections...');
  
  // More reliable selector for show all buttons - only use valid CSS
  const allButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent.toLowerCase();
    const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
    
    return text.includes('show all') || text.includes('voir tout') || 
           text.includes('voir les') || text.match(/show all \d+/i) ||
           ariaLabel.includes('show all');
  });
  
  console.log(`Found ${allButtons.length} "Show all" buttons`);
  
  for (const button of allButtons) {
    try {
      console.log('Clicking:', button.textContent.trim());
      button.click();
      // Wait for content to load after clicking
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error clicking button:', error);
    }
  }
  
  // Wait a bit more for all content to load
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('All sections expanded');
}

function extractLinkedInProfile() {
  const profileData = {
    personalInfo: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      linkedin: window.location.href,
      photo: '',
      website: '',
      github: '',
      portfolio: ''
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    awards: []
  };

  try {
    // Extract Name
    const nameElement = document.querySelector('h1.text-heading-xlarge, h1.inline.t-24.v-align-middle.break-words');
    if (nameElement) {
      profileData.personalInfo.fullName = nameElement.textContent.trim();
    }

    // Extract Title
    const titleElement = document.querySelector('.text-body-medium.break-words, .top-card-layout__headline');
    if (titleElement) {
      profileData.personalInfo.title = titleElement.textContent.trim();
    }

    // Extract Location
    const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words, .top-card__subline-item');
    if (locationElement) {
      profileData.personalInfo.location = locationElement.textContent.trim();
    }

    // Extract Profile Photo
    const photoElement = document.querySelector('img.pv-top-card-profile-picture__image, button img.ember-view');
    if (photoElement) {
      profileData.personalInfo.photo = photoElement.src || photoElement.getAttribute('src');
    }

    // Extract About/Summary
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      const summaryElement = aboutSection.parentElement.querySelector('.inline-show-more-text span[aria-hidden="true"], .pv-shared-text-with-see-more span');
      if (summaryElement) {
        profileData.personalInfo.summary = summaryElement.textContent.trim();
      }
    }

    // Extract Experience
    const experienceSection = document.querySelector('#experience');
    if (experienceSection) {
      const experienceList = experienceSection.parentElement.querySelectorAll('li.artdeco-list__item');
      experienceList.forEach((item, index) => {
        const titleEl = item.querySelector('.t-bold span[aria-hidden="true"], .mr1.t-bold span');
        const companyEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"], .t-14.t-normal.t-black--light span');
        const datesEl = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]:last-child, .pvs-entity__caption-wrapper time');
        const descriptionEl = item.querySelector('.inline-show-more-text span[aria-hidden="true"], .pvs-list__outer-container span');
        
        if (titleEl) {
          const title = titleEl.textContent.trim();
          const company = companyEl ? companyEl.textContent.trim() : '';
          const dates = datesEl ? datesEl.textContent.trim() : '';
          const description = descriptionEl ? descriptionEl.textContent.trim() : '';

          // Parse dates
          const dateMatch = dates.match(/(\w+ \d{4})\s*[-–]\s*(\w+ \d{4}|Present)/);
          let startDate = '';
          let endDate = '';
          let current = false;

          if (dateMatch) {
            startDate = dateMatch[1];
            endDate = dateMatch[2];
            current = endDate.toLowerCase().includes('present');
          }

          profileData.experience.push({
            id: `exp-${index}`,
            title: title,
            company: company,
            location: '',
            startDate: startDate,
            endDate: current ? '' : endDate,
            current: current,
            description: description,
            highlights: []
          });
        }
      });
    }

    // Extract Education
    const educationSection = document.querySelector('#education');
    if (educationSection) {
      const educationList = educationSection.parentElement.querySelectorAll('li.artdeco-list__item');
      educationList.forEach((item, index) => {
        const schoolEl = item.querySelector('.t-bold span[aria-hidden="true"], .mr1.hoverable-link-text span');
        const degreeEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
        const datesEl = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]');
        
        if (schoolEl) {
          const school = schoolEl.textContent.trim();
          const degree = degreeEl ? degreeEl.textContent.trim() : '';
          const dates = datesEl ? datesEl.textContent.trim() : '';

          const dateMatch = dates.match(/(\d{4})\s*[-–]\s*(\d{4})/);
          let startDate = '';
          let endDate = '';

          if (dateMatch) {
            startDate = dateMatch[1];
            endDate = dateMatch[2];
          }

          profileData.education.push({
            id: `edu-${index}`,
            degree: degree,
            institution: school,
            location: '',
            startDate: startDate,
            endDate: endDate,
            gpa: '',
            description: ''
          });
        }
      });
    }

    // Extract Skills
    const skillsSection = document.querySelector('#skills');
    if (skillsSection) {
      const skillsList = skillsSection.parentElement.querySelectorAll('.pvs-list__item--line-separated span[aria-hidden="true"]');
      const skills = [];
      skillsList.forEach(skillEl => {
        const skillText = skillEl.textContent.trim();
        if (skillText && !skillText.includes('Endorse') && skillText.length < 100) {
          skills.push(skillText);
        }
      });

      if (skills.length > 0) {
        profileData.skills.push({
          id: 'skills-1',
          category: 'Technical Skills',
          items: skills.slice(0, 20),
          level: 'intermediate'
        });
      }
    }

    // Extract Certifications/Licenses
    const certificationsSection = document.querySelector('#licenses_and_certifications');
    if (certificationsSection) {
      const certList = certificationsSection.parentElement.querySelectorAll('li.artdeco-list__item');
      certList.forEach((item, index) => {
        const nameEl = item.querySelector('.t-bold span[aria-hidden="true"]');
        const issuerEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
        const dateEl = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]');
        
        if (nameEl) {
          profileData.certifications.push({
            id: `cert-${index}`,
            name: nameEl.textContent.trim(),
            issuer: issuerEl ? issuerEl.textContent.trim() : '',
            date: dateEl ? dateEl.textContent.trim() : '',
            credentialUrl: ''
          });
        }
      });
    }

    // Extract Projects
    const projectsSection = document.querySelector('#projects');
    if (projectsSection) {
      const projectList = projectsSection.parentElement.querySelectorAll('li.artdeco-list__item');
      projectList.forEach((item, index) => {
        const nameEl = item.querySelector('.t-bold span[aria-hidden="true"]');
        const descEl = item.querySelector('.inline-show-more-text span[aria-hidden="true"]');
        
        if (nameEl) {
          profileData.projects.push({
            id: `proj-${index}`,
            name: nameEl.textContent.trim(),
            description: descEl ? descEl.textContent.trim() : '',
            technologies: [],
            url: '',
            githubUrl: ''
          });
        }
      });
    }

    // Extract Languages
    const languagesSection = document.querySelector('#languages');
    if (languagesSection) {
      const langList = languagesSection.parentElement.querySelectorAll('li.artdeco-list__item');
      langList.forEach((item, index) => {
        const langEl = item.querySelector('.t-bold span[aria-hidden="true"]');
        const profEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
        
        if (langEl) {
          const language = langEl.textContent.trim();
          const proficiency = profEl ? profEl.textContent.trim().toLowerCase() : 'conversational';
          
          let level = 'conversational';
          if (proficiency.includes('native') || proficiency.includes('bilingual')) {
            level = 'native';
          } else if (proficiency.includes('professional')) {
            level = 'professional';
          } else if (proficiency.includes('limited')) {
            level = 'basic';
          }

          profileData.languages.push({
            id: `lang-${index}`,
            language: language,
            proficiency: level
          });
        }
      });
    }

    console.log('Extracted profile data:', profileData);
    return profileData;

  } catch (error) {
    console.error('Error extracting LinkedIn profile:', error);
    return null;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Ping response to check if content script is loaded
  if (request.action === 'ping') {
    sendResponse({ success: true, loaded: true });
    return true;
  }
  
  if (request.action === 'extractProfile') {
    // Expand all sections first, then extract
    expandAllSections().then(() => {
      const profileData = extractLinkedInProfile();
      sendResponse({ success: true, data: profileData });
    }).catch(error => {
      console.error('Error during extraction:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
  return true;
});
