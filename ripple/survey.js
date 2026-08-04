(function () {
  'use strict';

  var endpointMeta = document.querySelector('meta[name="survey-endpoint"]');
  var API_ENDPOINT = endpointMeta ? endpointMeta.content.trim() : '';
  var PREVIEW = /(?:\?|&)preview(?:=|&|$)/i.test(window.location.search);
  var SURVEY_VERSION = '2026-08-05';

  var answers = {};
  var history = [];
  var currentId = 'phone_platform';
  var pendingPayload = null;

  var introScreen = document.getElementById('introScreen');
  var surveyScreen = document.getElementById('surveyScreen');
  var completeScreen = document.getElementById('completeScreen');
  var errorScreen = document.getElementById('errorScreen');
  var questionForm = document.getElementById('questionForm');
  var questionTitle = document.getElementById('questionTitle');
  var questionDescription = document.getElementById('questionDescription');
  var questionHelp = document.getElementById('questionHelp');
  var answerArea = document.getElementById('answerArea');
  var validationMessage = document.getElementById('validationMessage');
  var sectionLabel = document.getElementById('sectionLabel');
  var stepLabel = document.getElementById('stepLabel');
  var progressBar = document.getElementById('progressBar');
  var backButton = document.getElementById('backButton');
  var continueButton = document.getElementById('continueButton');

  function opt(value, label, detail, next, exclusive) {
    return { value: value, label: label, detail: detail || '', next: next, exclusive: !!exclusive };
  }

  function accessNext() {
    return answers.phone_platform === 'android' || answers.phone_platform === 'both'
      ? 'android_brand'
      : 'future_interest';
  }

  var QUESTIONS = {
    phone_platform: {
      section: 'Access', progress: 12, type: 'single', help: 'Choose one',
      title: 'Which phone do you mainly use?',
      description: 'Choose the device that best represents your everyday phone.',
      options: [
        opt('iphone', 'iPhone', '', 'download_status'),
        opt('android', 'Android phone', '', 'android_brand'),
        opt('both', 'Both iPhone and Android', '', 'download_status'),
        opt('other', 'Another phone or no smartphone', '', 'access_barrier')
      ]
    },
    download_status: {
      section: 'Access', progress: 22, type: 'single', help: 'Choose one',
      title: 'Were you able to download and open Ripple from the Apple App Store?',
      description: 'Choose the answer that best describes what happened when you tried the Apple App Store version.',
      options: [
        opt('downloaded', 'Yes — I downloaded and opened Ripple', '', 'usage_length'),
        opt('found_could_not', 'I found it, but could not download or open it', '', 'access_barrier'),
        opt('incompatible', 'My iPhone, iOS version or watch setup is not compatible', '', 'access_barrier'),
        opt('not_tried', 'I have not tried to download it yet', '', 'access_barrier')
      ]
    },
    access_barrier: {
      section: 'Access', progress: 30, type: 'single', help: 'Choose the closest answer',
      title: 'What is stopping you from using Ripple today?',
      description: 'This helps us understand which access problem matters most.',
      next: accessNext,
      options: [
        opt('android_only', 'I mainly use Android'),
        opt('no_apple_watch', 'I do not use an Apple Watch'),
        opt('ios_version', 'My iPhone cannot run the required iOS version'),
        opt('store_region', 'The App Store page or app is unavailable in my region'),
        opt('technical_problem', 'I had a technical problem downloading or opening it'),
        opt('not_ready', 'I have not had time to try it yet'),
        opt('other', 'Another reason')
      ]
    },
    android_brand: {
      section: 'Your device', progress: 36, type: 'single', help: 'Choose one',
      title: 'Which Android phone do you use most often?',
      description: 'We will use this only to understand device demand—not for advertising.',
      options: [
        opt('samsung', 'Samsung Galaxy', '', 'wearable'),
        opt('google', 'Google Pixel', '', 'wearable'),
        opt('xiaomi', 'Xiaomi, Redmi or POCO', '', 'wearable'),
        opt('oppo_oneplus', 'OPPO, OnePlus or realme', '', 'wearable'),
        opt('huawei_honor', 'Huawei or Honor', '', 'wearable'),
        opt('motorola', 'Motorola', '', 'wearable'),
        opt('other', 'Another Android brand', '', 'wearable'),
        opt('not_sure', 'I am not sure', '', 'wearable')
      ]
    },
    wearable: {
      section: 'Your device', progress: 43, type: 'single', help: 'Choose one',
      title: 'Which smartwatch or fitness tracker do you use most often?',
      description: 'Choose “None” if you do not currently wear one.',
      options: [
        opt('galaxy_watch', 'Samsung Galaxy Watch', '', 'future_interest'),
        opt('pixel_fitbit', 'Pixel Watch or Fitbit', '', 'future_interest'),
        opt('garmin', 'Garmin', '', 'future_interest'),
        opt('huawei_honor', 'Huawei or Honor wearable', '', 'future_interest'),
        opt('xiaomi', 'Xiaomi wearable', '', 'future_interest'),
        opt('apple_watch', 'Apple Watch', '', 'future_interest'),
        opt('other', 'Another wearable', '', 'future_interest'),
        opt('none', 'I do not use a smartwatch or fitness tracker', '', 'future_interest')
      ]
    },
    future_interest: {
      section: 'What you need', progress: 52, type: 'multi', help: 'Choose all that apply',
      title: 'What would make Ripple useful to you?',
      description: 'Select the benefits you would be most interested in trying.',
      next: 'android_intent',
      options: [
        opt('baseline', 'Learning what is normal for my own body'),
        opt('proactive', 'Noticing changes and speaking up before I check'),
        opt('explanations', 'Clear AI explanations with supporting evidence'),
        opt('daily_context', 'Connecting sleep, activity and other signals across my day'),
        opt('wearable_support', 'Support for my current watch or fitness tracker'),
        opt('privacy', 'Strong privacy and control over my data'),
        opt('unsure', 'I am not sure yet', '', null, true)
      ]
    },
    android_intent: {
      section: 'What you need', progress: 62, type: 'single', help: 'Choose one',
      title: 'How likely would you be to try Ripple if it supported your device?',
      options: [
        opt('very_likely', 'Very likely', '', 'update_preference'),
        opt('likely', 'Likely', '', 'update_preference'),
        opt('not_sure', 'Not sure', '', 'update_preference'),
        opt('unlikely', 'Unlikely', '', 'update_preference'),
        opt('very_unlikely', 'Very unlikely', '', 'update_preference')
      ]
    },
    update_preference: {
      section: 'Stay informed', progress: 82, type: 'single', help: 'Optional contact',
      title: 'Would you like us to contact you when Ripple becomes available for Android or your device?',
      description: 'Your answer is optional. We will not use it for general marketing.',
      options: [
        opt('email', 'Yes — contact me by email', '', 'contact_email'),
        opt('phone', 'Yes — contact me by phone', 'Include your country code on the next screen.', 'contact_phone'),
        opt('none', 'No, I do not want an availability update', '', 'complete')
      ]
    },

    usage_length: {
      section: 'Your experience', progress: 28, type: 'single', help: 'Choose one',
      title: 'How long have you been using Ripple?',
      options: [
        opt('today', 'I opened it for the first time today', '', 'overall_rating'),
        opt('two_to_seven_days', '2–7 days', '', 'overall_rating'),
        opt('one_to_four_weeks', '1–4 weeks', '', 'overall_rating'),
        opt('more_than_month', 'More than one month', '', 'overall_rating')
      ]
    },
    overall_rating: {
      section: 'Your experience', progress: 34, type: 'single', help: 'Choose one',
      title: 'What is your overall impression of Ripple so far?',
      options: [
        opt('very_positive', 'Very positive', '', 'onboarding_ease'),
        opt('positive', 'Positive', '', 'onboarding_ease'),
        opt('neutral', 'Neutral', '', 'onboarding_ease'),
        opt('negative', 'Negative', '', 'onboarding_ease'),
        opt('very_negative', 'Very negative', '', 'onboarding_ease')
      ]
    },
    onboarding_ease: {
      section: 'Your experience', progress: 40, type: 'single', help: 'Choose one',
      title: 'How easy was it to get started?',
      description: 'Think about sign-in, permissions and the first useful screen.',
      options: [
        opt('very_easy', 'Very easy', '', 'watch_connection'),
        opt('easy', 'Easy', '', 'watch_connection'),
        opt('neither', 'Neither easy nor difficult', '', 'watch_connection'),
        opt('difficult', 'Difficult', '', 'watch_connection'),
        opt('very_difficult', 'Very difficult', '', 'watch_connection')
      ]
    },
    watch_connection: {
      section: 'Your experience', progress: 46, type: 'single', help: 'Choose one',
      title: 'Were you able to connect Apple Watch health data?',
      options: [
        opt('smooth', 'Yes, and it worked smoothly', '', 'value_features'),
        opt('with_difficulty', 'Yes, but it took effort or troubleshooting', '', 'value_features'),
        opt('not_yet', 'Not yet—I am still setting it up', '', 'value_features'),
        opt('unable', 'No, I could not connect it', '', 'value_features'),
        opt('no_watch', 'I do not use an Apple Watch', '', 'value_features')
      ]
    },
    value_features: {
      section: 'Your experience', progress: 52, type: 'multi', help: 'Choose all that apply',
      title: 'Which parts of Ripple have felt valuable so far?',
      options: [
        opt('personal_baseline', 'My personal baseline'),
        opt('ai_explanations', 'AI explanations and the evidence behind them'),
        opt('proactive_checkins', 'Proactive check-ins or notifications'),
        opt('daily_overview', 'The daily overview'),
        opt('charts', 'Charts and trends'),
        opt('privacy', 'Privacy and control'),
        opt('nothing_yet', 'Nothing has felt valuable yet', '', null, true)
      ],
      next: 'insight_clarity'
    },
    insight_clarity: {
      section: 'Your experience', progress: 58, type: 'single', help: 'Choose one',
      title: 'How clear are Ripple’s explanations and insights?',
      options: [
        opt('very_clear', 'Very clear', '', 'trust_level'),
        opt('clear', 'Clear', '', 'trust_level'),
        opt('mixed', 'Sometimes clear, sometimes confusing', '', 'trust_level'),
        opt('confusing', 'Confusing', '', 'trust_level'),
        opt('very_confusing', 'Very confusing', '', 'trust_level'),
        opt('not_enough', 'I have not seen enough insights yet', '', 'trust_level')
      ]
    },
    trust_level: {
      section: 'Your experience', progress: 63, type: 'single', help: 'Choose one',
      title: 'How much do you trust Ripple’s interpretation of your wellness data?',
      options: [
        opt('a_lot', 'A lot', '', 'noticed_change'),
        opt('quite_a_bit', 'Quite a bit', '', 'noticed_change'),
        opt('somewhat', 'Somewhat', '', 'noticed_change'),
        opt('very_little', 'Very little', '', 'noticed_change'),
        opt('not_at_all', 'Not at all', '', 'noticed_change'),
        opt('too_early', 'It is too early for me to judge', '', 'noticed_change')
      ]
    },
    noticed_change: {
      section: 'Your experience', progress: 68, type: 'single', help: 'Choose one',
      title: 'Has Ripple helped you notice or understand a change you might otherwise have missed?',
      options: [
        opt('yes_acted', 'Yes, and I changed something I did', '', 'usage_frequency'),
        opt('yes_understood', 'Yes, it helped me understand what was happening', '', 'usage_frequency'),
        opt('not_yet', 'Not yet', '', 'usage_frequency'),
        opt('too_early', 'It is too early to tell', '', 'usage_frequency')
      ]
    },
    usage_frequency: {
      section: 'Your experience', progress: 72, type: 'single', help: 'Choose one',
      title: 'How often do you currently open or act on Ripple?',
      options: [
        opt('multiple_daily', 'Several times a day', '', 'friction'),
        opt('daily', 'About once a day', '', 'friction'),
        opt('few_week', 'A few times a week', '', 'friction'),
        opt('less_week', 'Less than once a week', '', 'friction'),
        opt('notifications_only', 'Only when Ripple notifies me', '', 'friction'),
        opt('stopped', 'I have stopped using it', '', 'friction')
      ]
    },
    friction: {
      section: 'Your experience', progress: 76, type: 'multi', help: 'Choose all that apply',
      title: 'Which problems have you experienced?',
      description: 'Choose “None of these” if everything has worked as expected.',
      options: [
        opt('sign_in', 'Sign-in or account setup'),
        opt('permissions', 'Health permissions'),
        opt('watch_sync', 'Apple Watch or health-data sync'),
        opt('slow_loading', 'Slow loading or waiting'),
        opt('unclear_ai', 'An explanation that felt unclear or unhelpful'),
        opt('notifications', 'Too many, too few or poorly timed notifications'),
        opt('navigation', 'Finding my way around the app'),
        opt('crash_bug', 'A crash, freeze or other technical bug'),
        opt('none', 'None of these', '', null, true)
      ],
      next: 'improvement_priority'
    },
    improvement_priority: {
      section: 'Your experience', progress: 81, type: 'single', help: 'Choose one priority',
      title: 'What should we improve first?',
      options: [
        opt('reliability', 'Reliability and health-data sync', '', 'recommend_score'),
        opt('clarity', 'Clearer explanations', '', 'recommend_score'),
        opt('speed', 'Faster responses and loading', '', 'recommend_score'),
        opt('actions', 'More useful next-step suggestions', '', 'recommend_score'),
        opt('charts', 'Better charts and trends', '', 'recommend_score'),
        opt('notifications', 'Better notification timing and control', '', 'recommend_score'),
        opt('privacy', 'More privacy controls and explanations', '', 'recommend_score'),
        opt('nothing_major', 'Nothing major right now', '', 'recommend_score')
      ]
    },
    recommend_score: {
      section: 'Your experience', progress: 86, type: 'scale', help: '0 = not at all likely · 10 = extremely likely',
      title: 'How likely are you to recommend Ripple to someone who uses an Apple Watch?',
      options: [0,1,2,3,4,5,6,7,8,9,10].map(function (n) { return opt(String(n), String(n), '', 'continue_intent'); })
    },
    continue_intent: {
      section: 'Your experience', progress: 90, type: 'single', help: 'Choose one',
      title: 'How likely are you to keep using Ripple over the next month?',
      options: [
        opt('definitely', 'Definitely will', '', 'followup_preference'),
        opt('probably', 'Probably will', '', 'followup_preference'),
        opt('not_sure', 'Not sure', '', 'followup_preference'),
        opt('probably_not', 'Probably will not', '', 'followup_preference'),
        opt('definitely_not', 'Definitely will not', '', 'followup_preference')
      ]
    },
    followup_preference: {
      section: 'Follow-up', progress: 94, type: 'single', help: 'Optional contact',
      title: 'May we contact you for a short follow-up about your Ripple experience?',
      description: 'This is optional and separate from your survey answers.',
      options: [
        opt('email', 'Yes — contact me by email', '', 'contact_email'),
        opt('phone', 'Yes — contact me by phone', 'Include your country code on the next screen.', 'contact_phone'),
        opt('none', 'No follow-up, thank you', '', 'complete')
      ]
    },

    contact_email: {
      section: 'Contact permission', progress: 97, type: 'email', help: 'Contact details are optional',
      title: 'What email address should we use?',
      description: 'We will use it only for the update or follow-up you selected.',
      next: 'contact_consent'
    },
    contact_phone: {
      section: 'Contact permission', progress: 97, type: 'phone', help: 'Contact details are optional',
      title: 'What phone number should we use?',
      description: 'Include your country code, for example +65 9123 4567. We will use it only for the purpose you selected.',
      next: 'contact_consent'
    },
    contact_consent: {
      section: 'Contact permission', progress: 99, type: 'single', help: 'Choose one',
      title: 'May Ripple use this contact detail for the purpose you selected?',
      description: 'Choosing “No” removes the contact detail from your submission.',
      options: [
        opt('yes', 'Yes, I agree', '', 'complete'),
        opt('no', 'No, submit my answers without contact details', '', 'complete')
      ]
    }
  };

  function setOnlyScreen(screen) {
    [introScreen, surveyScreen, completeScreen, errorScreen].forEach(function (item) {
      item.hidden = item !== screen;
    });
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function renderQuestion() {
    var q = QUESTIONS[currentId];
    if (!q) throw new Error('Unknown question: ' + currentId);
    validationMessage.textContent = '';
    questionTitle.textContent = q.title;
    questionDescription.textContent = q.description || '';
    questionDescription.hidden = !q.description;
    questionHelp.textContent = q.help || '';
    sectionLabel.textContent = q.section.toUpperCase();
    stepLabel.textContent = 'STEP ' + (history.length + 1);
    progressBar.style.width = q.progress + '%';
    backButton.disabled = history.length === 0;
    answerArea.className = 'answer-area' + (q.type === 'scale' ? ' scale-grid' : '');
    answerArea.innerHTML = '';

    if (q.type === 'single' || q.type === 'multi' || q.type === 'scale') {
      renderChoices(q);
    } else {
      renderContact(q);
    }
    window.setTimeout(function () { questionTitle.focus({ preventScroll: true }); }, 0);
  }

  function renderChoices(q) {
    var selected = answers[currentId];
    q.options.forEach(function (option, index) {
      var label = document.createElement('label');
      label.className = 'choice';
      var input = document.createElement('input');
      input.type = q.type === 'multi' ? 'checkbox' : 'radio';
      input.name = currentId;
      input.value = option.value;
      input.dataset.exclusive = option.exclusive ? 'true' : 'false';
      input.id = currentId + '_' + index;
      input.checked = Array.isArray(selected)
        ? selected.indexOf(option.value) !== -1
        : selected === option.value;
      if (q.type === 'multi') input.addEventListener('change', handleExclusiveChoice);

      var text = document.createElement('span');
      var strong = document.createElement('strong');
      strong.textContent = option.label;
      text.appendChild(strong);
      if (option.detail) {
        var small = document.createElement('small');
        small.textContent = option.detail;
        text.appendChild(small);
      }
      label.appendChild(input);
      label.appendChild(text);
      answerArea.appendChild(label);
    });
  }

  function renderContact(q) {
    var wrap = document.createElement('div');
    wrap.className = 'contact-field';
    var label = document.createElement('label');
    label.htmlFor = 'contactInput';
    label.textContent = q.type === 'email' ? 'Email address' : 'Phone number';
    var input = document.createElement('input');
    input.id = 'contactInput';
    input.name = currentId;
    input.type = q.type === 'email' ? 'email' : 'tel';
    input.autocomplete = q.type === 'email' ? 'email' : 'tel';
    input.placeholder = q.type === 'email' ? 'you@example.com' : '+65 9123 4567';
    input.required = true;
    input.maxLength = q.type === 'email' ? 254 : 40;
    input.value = answers[currentId] || '';
    if (q.type === 'phone') input.inputMode = 'tel';
    var note = document.createElement('p');
    note.className = 'field-note';
    note.textContent = 'Your contact detail is stored privately and is never written to a public GitHub issue or repository file.';
    wrap.appendChild(label);
    wrap.appendChild(input);
    wrap.appendChild(note);
    answerArea.appendChild(wrap);
    window.setTimeout(function () { input.focus({ preventScroll: true }); }, 0);
  }

  function handleExclusiveChoice(event) {
    var changed = event.currentTarget;
    if (!changed.checked) return;
    var boxes = answerArea.querySelectorAll('input[type="checkbox"]');
    boxes.forEach(function (box) {
      if (box === changed) return;
      if (changed.dataset.exclusive === 'true' || box.dataset.exclusive === 'true') box.checked = false;
    });
  }

  function readAnswer(q) {
    if (q.type === 'multi') {
      return Array.prototype.map.call(answerArea.querySelectorAll('input:checked'), function (input) { return input.value; });
    }
    if (q.type === 'single' || q.type === 'scale') {
      var checked = answerArea.querySelector('input:checked');
      return checked ? checked.value : '';
    }
    var input = document.getElementById('contactInput');
    return input ? input.value.trim() : '';
  }

  function validateAnswer(q, value) {
    if (q.type === 'multi' && value.length === 0) return 'Please choose at least one option.';
    if ((q.type === 'single' || q.type === 'scale') && !value) return 'Please choose an option.';
    if (q.type === 'email') {
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 254) return 'Please enter a valid email address.';
    }
    if (q.type === 'phone') {
      var normalized = value.replace(/[()\-\s.]/g, '');
      if (!/^\+?[1-9]\d{6,14}$/.test(normalized)) return 'Please enter 7–15 digits and include the country code.';
    }
    return '';
  }

  function nextFor(q, value) {
    if (typeof q.next === 'function') return q.next(value);
    if (q.next) return q.next;
    var option = (q.options || []).filter(function (item) { return item.value === value; })[0];
    return option ? option.next : null;
  }

  function contactObject() {
    var isUser = answers.download_status === 'downloaded';
    var preference = isUser ? answers.followup_preference : answers.update_preference;
    if (answers.contact_consent !== 'yes' || (preference !== 'email' && preference !== 'phone')) return null;
    return {
      type: preference,
      value: preference === 'email' ? answers.contact_email : answers.contact_phone,
      purpose: isUser ? 'research_followup' : 'device_availability'
    };
  }

  function buildPayload() {
    var cleanAnswers = {};
    Object.keys(answers).forEach(function (key) {
      if (key !== 'contact_email' && key !== 'contact_phone') cleanAnswers[key] = answers[key];
    });
    var isUser = answers.download_status === 'downloaded';
    return {
      survey_key: 'ripple_experience',
      survey_version: SURVEY_VERSION,
      route: isUser ? 'product_user' : 'access_waitlist',
      answers: cleanAnswers,
      contact: contactObject(),
      consent: true,
      locale: navigator.language || null,
      source: 'monika-github-pages',
      website: document.getElementById('website').value || ''
    };
  }

  async function submitPayload(payload) {
    continueButton.disabled = true;
    continueButton.textContent = 'Submitting…';
    pendingPayload = payload;

    if (PREVIEW) {
      showComplete(payload, true);
      continueButton.disabled = false;
      continueButton.innerHTML = 'Continue <span aria-hidden="true">→</span>';
      return;
    }

    try {
      if (!API_ENDPOINT) {
        throw new Error('This survey is not accepting responses yet. Please use preview mode while the response destination is being connected.');
      }
      var response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        if (response.status === 429) throw new Error('Too many submissions were sent from this connection. Please wait and try again later.');
        if (response.status === 400) throw new Error('One answer could not be validated. Please go back and check your response.');
        throw new Error('The survey service is temporarily unavailable. Please try again.');
      }
      showComplete(payload, false);
    } catch (error) {
      document.getElementById('errorMessage').textContent = error.message || 'Please check your connection and try again.';
      setOnlyScreen(errorScreen);
    } finally {
      continueButton.disabled = false;
      continueButton.innerHTML = 'Continue <span aria-hidden="true">→</span>';
    }
  }

  function showComplete(payload, preview) {
    var contact = payload.contact;
    var message;
    if (preview) {
      message = 'Preview complete. Nothing was sent or saved.';
    } else if (contact && contact.purpose === 'device_availability') {
      message = 'You are on the availability list. We will use your chosen contact method only when Ripple supports Android or your device.';
    } else if (contact) {
      message = 'Your feedback is saved. We may use your chosen contact method for the short follow-up you accepted.';
    } else {
      message = 'Your answers are saved. No contact details were collected.';
    }
    document.getElementById('completeMessage').textContent = message;
    if (preview) {
      document.getElementById('previewOutput').hidden = false;
      document.getElementById('previewJson').textContent = JSON.stringify(payload, null, 2);
    }
    setOnlyScreen(completeScreen);
    progressBar.style.width = '100%';
  }

  function restart() {
    answers = {};
    history = [];
    currentId = 'phone_platform';
    pendingPayload = null;
    document.getElementById('startConsent').checked = false;
    document.getElementById('startButton').disabled = true;
    document.getElementById('previewOutput').hidden = true;
    setOnlyScreen(introScreen);
  }

  document.getElementById('startConsent').addEventListener('change', function (event) {
    document.getElementById('startButton').disabled = !event.currentTarget.checked;
  });

  document.getElementById('startButton').addEventListener('click', function () {
    setOnlyScreen(surveyScreen);
    renderQuestion();
  });

  questionForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var q = QUESTIONS[currentId];
    var value = readAnswer(q);
    var error = validateAnswer(q, value);
    if (error) {
      validationMessage.textContent = error;
      return;
    }
    if (q.type === 'email') value = value.toLowerCase();
    if (q.type === 'phone') value = value.replace(/[()\-\s.]/g, '');
    answers[currentId] = value;
    if (currentId === 'contact_consent' && value === 'no') {
      delete answers.contact_email;
      delete answers.contact_phone;
    }

    var next = nextFor(q, value);
    if (!next) {
      validationMessage.textContent = 'This answer does not have a valid next step.';
      return;
    }
    if (next === 'complete') {
      submitPayload(buildPayload());
      return;
    }
    history.push(currentId);
    currentId = next;
    renderQuestion();
  });

  backButton.addEventListener('click', function () {
    if (!history.length) return;
    delete answers[currentId];
    currentId = history.pop();
    renderQuestion();
  });

  document.getElementById('restartButton').addEventListener('click', restart);
  document.getElementById('newResponseButton').addEventListener('click', restart);
  document.getElementById('retryButton').addEventListener('click', function () {
    if (pendingPayload) submitPayload(pendingPayload);
  });
  document.getElementById('returnButton').addEventListener('click', function () {
    setOnlyScreen(surveyScreen);
    renderQuestion();
  });

  if (PREVIEW) document.getElementById('previewBanner').hidden = false;
})();
