import fs from 'fs';

export type ThemeLintIssue = {
  level: 'error' | 'warning';
  code: string;
  message: string;
};

export type ThemeLintResult = {
  ok: boolean;
  issues: ThemeLintIssue[];
};

const readText = (filePath: string) => fs.readFileSync(filePath, 'utf8');

export const lintThemePackage = (input: {
  themeId: string;
  manifestDirectory: string;
  stylesheetPath: string;
}): ThemeLintResult => {
  const issues: ThemeLintIssue[] = [];

  if (!fs.existsSync(input.stylesheetPath)) {
    issues.push({
      level: 'error',
      code: 'missing_stylesheet',
      message: `Stylesheet file is missing at "${input.stylesheetPath}".`,
    });
    return { ok: false, issues };
  }

  const css = readText(input.stylesheetPath);

  if (/body\s*\[\s*data-theme/i.test(css)) {
    issues.push({
      level: 'error',
      code: 'invalid_selector',
      message: 'Use .storefront-shell[data-store-theme] selectors instead of body[data-theme].',
    });
  }

  const scopedSelector = `.storefront-shell[data-store-theme='${input.themeId}']`;
  if (!css.includes(scopedSelector)) {
    issues.push({
      level: 'warning',
      code: 'missing_scope_root',
      message: `Add a root scope block for ${scopedSelector} so your theme tokens apply reliably.`,
    });
  }

  const layoutPath = `${input.manifestDirectory}/layout.json`;
  if (fs.existsSync(layoutPath)) {
    try {
      const layout = JSON.parse(readText(layoutPath)) as Record<string, unknown>;
      const home = layout.home;
      if (home !== undefined && (typeof home !== 'object' || home === null || Array.isArray(home))) {
        issues.push({
          level: 'error',
          code: 'invalid_layout',
          message: 'layout.json "home" must be an object when provided.',
        });
      }
    } catch {
      issues.push({
        level: 'error',
        code: 'invalid_layout_json',
        message: 'layout.json must be valid JSON.',
      });
    }
  }

  const readmePath = `${input.manifestDirectory}/README.md`;
  if (!fs.existsSync(readmePath)) {
    issues.push({
      level: 'warning',
      code: 'missing_readme',
      message: 'Consider adding README.md with theme notes for the store owner.',
    });
  }

  return {
    ok: !issues.some((issue) => issue.level === 'error'),
    issues,
  };
};

export const formatThemeLintMessage = (result: ThemeLintResult) => {
  if (result.ok && result.issues.length === 0) {
    return '';
  }

  const lines = result.issues.map((issue) => `${issue.level === 'error' ? 'Error' : 'Warning'}: ${issue.message}`);
  return lines.join('\n');
};
