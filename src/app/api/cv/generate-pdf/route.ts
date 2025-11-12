import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

// HTML template generators (instead of React components)
function generateModernTemplate(cvData: any, settings: any) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, awards } = cvData;
  
  return `
    <div class="min-h-screen bg-white p-12 text-gray-900" style="font-family: Arial, sans-serif;">
      <!-- Header -->
      <div class="mb-8 border-b-4 pb-6 flex gap-6" style="border-color: ${settings.colorScheme};">
        ${personalInfo.photo ? `
          <div class="flex-shrink-0">
            <div class="relative w-24 h-24 rounded-full overflow-hidden border-4" style="border-color: ${settings.colorScheme};">
              <img src="${personalInfo.photo}" alt="Profile" class="object-cover w-full h-full" />
            </div>
          </div>
        ` : ''}
        
        <div class="flex-1">
          <h1 class="mb-2 text-4xl font-bold" style="color: ${settings.colorScheme};">
            ${personalInfo.fullName || 'Your Name'}
          </h1>
          <p class="mb-4 text-xl text-gray-600">${personalInfo.title || 'Professional Title'}</p>
          
          <div class="flex flex-wrap gap-4 text-sm text-gray-600">
            ${personalInfo.email ? `<div class="flex items-center gap-1">${personalInfo.email}</div>` : ''}
            ${personalInfo.phone ? `<div class="flex items-center gap-1">${personalInfo.phone}</div>` : ''}
            ${personalInfo.location ? `<div class="flex items-center gap-1">${personalInfo.location}</div>` : ''}
            ${personalInfo.linkedin ? `<div class="flex items-center gap-1">LinkedIn</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Summary -->
      ${personalInfo.summary ? `
        <div class="mb-6">
          <h2 class="mb-3 text-xl font-bold" style="color: ${settings.colorScheme};">Professional Summary</h2>
          <p class="text-sm leading-relaxed text-gray-700">${personalInfo.summary}</p>
        </div>
      ` : ''}

      <!-- Experience -->
      ${experience && experience.length > 0 ? `
        <div class="mb-6">
          <h2 class="mb-3 text-xl font-bold" style="color: ${settings.colorScheme};">Experience</h2>
          <div class="space-y-4">
            ${experience.map((exp: any) => `
              <div>
                <div class="flex justify-between">
                  <div>
                    <h3 class="font-bold">${exp.title}</h3>
                    <p class="text-sm text-gray-600">${exp.company}</p>
                  </div>
                  <div class="text-right text-sm text-gray-600">
                    <p>${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</p>
                    <p>${exp.location || ''}</p>
                  </div>
                </div>
                ${exp.description && exp.description.length > 0 ? `
                  <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                    ${exp.description.map((bullet: string) => `<li>${bullet}</li>`).join('')}
                  </ul>
                ` : ''}
                ${exp.highlights && exp.highlights.length > 0 ? `
                  <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                    ${exp.highlights.map((h: string) => `<li>${h}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education -->
      ${education && education.length > 0 ? `
        <div class="mb-6">
          <h2 class="mb-3 text-xl font-bold" style="color: ${settings.colorScheme};">Education</h2>
          <div class="space-y-3">
            ${education.map((edu: any) => `
              <div class="flex justify-between">
                <div>
                  <h3 class="font-bold">${edu.degree}</h3>
                  <p class="text-sm text-gray-600">${edu.institution}</p>
                  ${edu.gpa ? `<p class="text-sm text-gray-600">GPA: ${edu.gpa}</p>` : ''}
                </div>
                <div class="text-right text-sm text-gray-600">
                  <p>${edu.startDate} - ${edu.endDate}</p>
                  <p>${edu.location || ''}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Skills -->
      ${skills && skills.length > 0 ? `
        <div class="mb-6">
          <h2 class="mb-3 text-xl font-bold" style="color: ${settings.colorScheme};">Skills</h2>
          <div class="space-y-2">
            ${skills.map((skill: any) => `
              <p class="text-sm">
                <span class="font-semibold">${skill.category}:</span> ${skill.items.join(' • ')}
              </p>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Projects -->
      ${projects && projects.length > 0 ? `
        <div class="mb-6">
          <h2 class="mb-3 text-xl font-bold" style="color: ${settings.colorScheme};">Projects</h2>
          <div class="space-y-3">
            ${projects.map((proj: any) => `
              <div>
                <h3 class="font-bold">${proj.name}</h3>
                ${proj.description && proj.description.length > 0 ? `
                  <ul class="mt-1 list-disc pl-5 text-sm text-gray-700">
                    ${proj.description.map((bullet: string) => `<li>${bullet}</li>`).join('')}
                  </ul>
                ` : ''}
                <p class="mt-1 text-sm text-gray-600">
                  <span class="font-semibold">Technologies:</span> ${proj.technologies.join(', ')}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Languages -->
      ${languages && languages.length > 0 ? `
        <div class="mb-6">
          <h2 class="mb-3 text-xl font-bold" style="color: ${settings.colorScheme};">Languages</h2>
          <div class="flex flex-wrap gap-4">
            ${languages.map((lang: any) => `
              <div class="text-sm">
                <span class="font-semibold">${typeof lang === 'string' ? lang : lang.language}</span>
                ${typeof lang === 'object' && lang.proficiency ? ` - <span class="text-gray-600">${lang.proficiency}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateClassicTemplate(cvData: any, settings: any) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, awards } = cvData;
  
  return `
    <div class="min-h-screen bg-white p-12 text-gray-900" style="font-family: 'Times New Roman', serif;">
      <!-- Header -->
      <div class="text-center mb-8 pb-6 border-b-2 border-gray-800">
        
        <h1 class="mb-2 text-5xl font-bold uppercase tracking-wide text-gray-900">
          ${personalInfo.fullName || 'Your Name'}
        </h1>
        <p class="mb-4 text-lg italic text-gray-700">${personalInfo.title || 'Professional Title'}</p>
        
        <div class="flex justify-center flex-wrap gap-4 text-sm text-gray-600">
          ${personalInfo.email ? `<span> ${personalInfo.email}</span>` : ''}
          ${personalInfo.phone ? `<span> ${personalInfo.phone}</span>` : ''}
          ${personalInfo.location ? `<span>${personalInfo.location}</span>` : ''}
          ${personalInfo.linkedin ? `<span> LinkedIn</span>` : ''}
        </div>
      </div>

      <!-- Summary -->
      ${personalInfo.summary ? `
        <div class="mb-8">
          <h2 class="mb-3 text-2xl font-bold uppercase border-b-2 border-gray-800 pb-2">Professional Summary</h2>
          <p class="text-sm leading-relaxed text-gray-700 text-justify">${personalInfo.summary}</p>
        </div>
      ` : ''}

      <!-- Experience -->
      ${experience && experience.length > 0 ? `
        <div class="mb-8">
          <h2 class="mb-4 text-2xl font-bold uppercase border-b-2 border-gray-800 pb-2">Work Experience</h2>
          <div class="space-y-6">
            ${experience.map((exp: any) => `
              <div>
                <div class="mb-2">
                  <h3 class="text-lg font-bold">${exp.title}</h3>
                  <p class="text-base italic text-gray-700">${exp.company} ${exp.location ? `• ${exp.location}` : ''}</p>
                  <p class="text-sm text-gray-600">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</p>
                </div>
                ${exp.description && exp.description.length > 0 ? `
                  <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                    ${exp.description.map((bullet: string) => `<li>${bullet}</li>`).join('')}
                  </ul>
                ` : ''}
                ${exp.highlights && exp.highlights.length > 0 ? `
                  <ul class="list-disc pl-6 text-sm text-gray-700">
                    ${exp.highlights.map((h: string) => `<li class="mb-1">${h}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education -->
      ${education && education.length > 0 ? `
        <div class="mb-8">
          <h2 class="mb-4 text-2xl font-bold uppercase border-b-2 border-gray-800 pb-2">Education</h2>
          <div class="space-y-4">
            ${education.map((edu: any) => `
              <div>
                <h3 class="text-lg font-bold">${edu.degree}</h3>
                <p class="text-base italic text-gray-700">${edu.institution} ${edu.location ? `• ${edu.location}` : ''}</p>
                <p class="text-sm text-gray-600">${edu.startDate} - ${edu.endDate} ${edu.gpa ? `• GPA: ${edu.gpa}` : ''}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Skills -->
      ${skills && skills.length > 0 ? `
        <div class="mb-8">
          <h2 class="mb-4 text-2xl font-bold uppercase border-b-2 border-gray-800 pb-2">Skills</h2>
          <div class="space-y-2">
            ${skills.map((skill: any) => `
              <p class="text-sm">
                <span class="font-bold">${skill.category}:</span> ${skill.items.join(', ')}
              </p>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Projects -->
      ${projects && projects.length > 0 ? `
        <div class="mb-6">
          <h2 class="mb-3 text-xl font-bold" style="color: ${settings.colorScheme};">Projects</h2>
          <div class="space-y-3">
            ${projects.map((proj: any) => `
              <div>
                <h3 class="font-bold">${proj.name}</h3>
                ${proj.description && proj.description.length > 0 ? `
                  <ul class="mt-1 list-disc pl-5 text-sm text-gray-700">
                    ${proj.description.map((bullet: string) => `<li>${bullet}</li>`).join('')}
                  </ul>
                ` : ''}
                <p class="mt-1 text-sm text-gray-600">
                  <span class="font-semibold">Technologies:</span> ${proj.technologies.join(', ')}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Languages -->
      ${languages && languages.length > 0 ? `
        <div class="mb-8">
          <h2 class="mb-4 text-2xl font-bold uppercase border-b-2 border-gray-800 pb-2">Languages</h2>
          <div class="flex flex-wrap gap-6">
            ${languages.map((lang: any) => `
              <span class="text-sm">
                <span class="font-bold">${typeof lang === 'string' ? lang : lang.language}</span>
                ${typeof lang === 'object' && lang.proficiency ? ` - ${lang.proficiency}` : ''}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateMinimalTemplate(cvData: any, settings: any) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, awards } = cvData;
  
  return `
    <div class="min-h-screen bg-white p-16 text-gray-900" style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="mb-1 text-5xl font-light tracking-tight text-gray-900">
          ${personalInfo.fullName || 'Your Name'}
        </h1>
        <p class="mb-6 text-base text-gray-500">${personalInfo.title || 'Professional Title'}</p>
        
        <div class="flex gap-6 text-xs text-gray-500">
          ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
          ${personalInfo.phone ? `<span>${personalInfo.phone}</span>` : ''}
          ${personalInfo.location ? `<span>${personalInfo.location}</span>` : ''}
        </div>
      </div>

      <!-- Summary -->
      ${personalInfo.summary ? `
        <div class="mb-10">
          <p class="text-sm leading-relaxed text-gray-700">${personalInfo.summary}</p>
        </div>
      ` : ''}

      <!-- Experience -->
      ${experience && experience.length > 0 ? `
        <div class="mb-10">
          <h2 class="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">Experience</h2>
          <div class="space-y-8">
            ${experience.map((exp: any) => `
              <div>
                <div class="mb-3">
                  <h3 class="text-base font-medium text-gray-900">${exp.title}</h3>
                  <p class="text-sm text-gray-600">${exp.company} ${exp.location ? `• ${exp.location}` : ''} • ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</p>
                </div>
                ${exp.description && exp.description.length > 0 ? `
                  <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                    ${exp.description.map((bullet: string) => `<li>${bullet}</li>`).join('')}
                  </ul>
                ` : ''}
                ${exp.highlights && exp.highlights.length > 0 ? `
                  <ul class="space-y-1 text-sm text-gray-700">
                    ${exp.highlights.map((h: string) => `<li class="pl-4 border-l-2 border-gray-300">${h}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education -->
      ${education && education.length > 0 ? `
        <div class="mb-10">
          <h2 class="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">Education</h2>
          <div class="space-y-4">
            ${education.map((edu: any) => `
              <div>
                <h3 class="text-base font-medium text-gray-900">${edu.degree}</h3>
                <p class="text-sm text-gray-600">${edu.institution} ${edu.location ? `• ${edu.location}` : ''} • ${edu.startDate} - ${edu.endDate}</p>
                ${edu.gpa ? `<p class="text-sm text-gray-600">GPA: ${edu.gpa}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Skills -->
      ${skills && skills.length > 0 ? `
        <div class="mb-10">
          <h2 class="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">Skills</h2>
          <div class="space-y-2">
            ${skills.map((skill: any) => `
              <div class="text-sm">
                <span class="font-medium text-gray-900">${skill.category}</span>
                <span class="text-gray-600"> — ${skill.items.join(', ')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Projects -->
      ${projects && projects.length > 0 ? `
        <div class="mb-6">
          <h2 class="mb-3 text-xl font-bold" style="color: ${settings.colorScheme};">Projects</h2>
          <div class="space-y-3">
            ${projects.map((proj: any) => `
              <div>
                <h3 class="font-bold">${proj.name}</h3>
                ${proj.description && proj.description.length > 0 ? `
                  <ul class="mt-1 list-disc pl-5 text-sm text-gray-700">
                    ${proj.description.map((bullet: string) => `<li>${bullet}</li>`).join('')}
                  </ul>
                ` : ''}
                <p class="mt-1 text-sm text-gray-600">
                  <span class="font-semibold">Technologies:</span> ${proj.technologies.join(', ')}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Languages -->
      ${languages && languages.length > 0 ? `
        <div class="mb-10">
          <h2 class="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">Languages</h2>
          <div class="flex gap-8 text-sm">
            ${languages.map((lang: any) => `
              <span class="text-gray-700">
                ${typeof lang === 'string' ? lang : `${lang.language} <span class="text-gray-500">(${lang.proficiency})</span>`}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}



export async function POST(request: NextRequest) {
  try {
    const { cvData, template, colorScheme } = await request.json();

    // Select the appropriate template
    let htmlContent;
    const defaultSettings = {
      template: template || "modern",
      colorScheme: colorScheme || "#3b82f6",
      fontSize: "medium",
      spacing: "normal",
      showPhoto: true,
    };
    const settings = {
      ...defaultSettings,
      ...(cvData?.settings || {}),
    };


    switch (template) {
      case "modern":
        htmlContent = generateModernTemplate(cvData, settings);
        break;
      case "classic":
        htmlContent = generateClassicTemplate(cvData, settings);
        break;
      case "minimal":
        htmlContent = generateMinimalTemplate(cvData, settings);
        break;
      default:
        htmlContent = generateModernTemplate(cvData, settings);
    }

    // Wrap in a complete HTML document with Tailwind CSS
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { margin: 0; size: A4; }
            }
            * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    return new Response(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: String(error) },
      { status: 500 }
    );
  }
}