const BASE = 'http://localhost:9100/api/v1';

let pass = 0;
let fail = 0;
const failures = [];

async function call(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* bo'sh javob */
  }

  return { status: res.status, json };
}

function check(label, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    failures.push(label);
    console.log(`  ✗ ${label}${detail ? ` — ${JSON.stringify(detail).slice(0, 300)}` : ''}`);
  }
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

(async () => {
  // ---------------------------------------------------------------- AUTH
  section('Auth');

  const adminLogin = await call('POST', '/auth/login', {
    body: { email: 'admin@kidslearn.uz', password: 'password123' },
  });
  check('admin login', adminLogin.status === 200, adminLogin.json);
  const admin = adminLogin.json?.data?.accessToken;

  const parentLogin = await call('POST', '/auth/login', {
    body: { email: 'ota-ona@kidslearn.uz', password: 'password123' },
  });
  check('parent login', parentLogin.status === 200, parentLogin.json);
  const parent = parentLogin.json?.data?.accessToken;

  const badLogin = await call('POST', '/auth/login', {
    body: { email: 'ota-ona@kidslearn.uz', password: 'wrong' },
  });
  check('wrong password -> 400', badLogin.status === 400);

  const me = await call('GET', '/auth/me', { token: parent });
  const children = me.json?.data?.children ?? [];
  check('parent /me returns children with age', children.length === 3 && typeof children[0].age === 'number', me.json);

  const zilola = children.find(c => c.fullName === 'Zilola');
  check('Zilola is AGE_3_4', zilola?.ageGroup === 'AGE_3_4', zilola);

  const select = await call('POST', `/auth/children/${zilola.id}/select`, { token: parent });
  check('select child -> child token', select.status === 200, select.json);
  const child = select.json?.data?.accessToken;

  const childMe = await call('GET', '/auth/me', { token: child });
  check('child /me role=CHILD', childMe.json?.data?.role === 'CHILD', childMe.json);

  // ------------------------------------------------------------ RBAC
  section('RBAC');

  check('no token -> 401', (await call('GET', '/auth/me')).status === 401);
  check('child -> admin endpoint 403', (await call('GET', '/users/paginated', { token: child })).status === 403);
  check('parent -> admin endpoint 403', (await call('GET', '/users/paginated', { token: parent })).status === 403);
  check('admin -> users list 200', (await call('GET', '/users/paginated', { token: admin })).status === 200);
  check(
    'child -> re-select child 403',
    (await call('POST', `/auth/children/${zilola.id}/select`, { token: child })).status === 403,
  );
  check('parent -> child-only endpoint 403', (await call('GET', '/lessons/for-me', { token: parent })).status === 403);

  // --------------------------------------------------------- CHILDREN
  section('Children');

  const created = await call('POST', '/children', {
    token: parent,
    body: { fullName: 'Test Bola', birthDate: '2023-06-01', avatar: '🐣' },
  });
  check('parent creates child', created.status === 200 || created.status === 201, created.json);
  const newChildId = created.json?.data?.id;

  const dup = await call('POST', '/children', {
    token: parent,
    body: { fullName: 'Test Bola', birthDate: '2023-06-01' },
  });
  check('duplicate name -> 400', dup.status === 400);

  const future = await call('POST', '/children', {
    token: parent,
    body: { fullName: 'Kelajak', birthDate: '2030-01-01' },
  });
  check('future birth date -> 400', future.status === 400);

  const childList = await call('GET', '/children/paginated', { token: child });
  check(
    'child session sees only itself',
    childList.json?.data?.count === 1 && childList.json?.data?.items[0].id === zilola.id,
    childList.json?.data,
  );

  const searchByParent = await call('GET', '/children/paginated?search=Malika', { token: admin });
  check('admin search by parent name', (searchByParent.json?.data?.count ?? 0) >= 3, searchByParent.json?.data?.count);

  const byAgeGroup = await call('GET', '/children/paginated?ageGroup=AGE_1_2', { token: admin });
  check('filter by age group', (byAgeGroup.json?.data?.count ?? 0) >= 1, byAgeGroup.json?.data?.count);

  if (newChildId) {
    check('delete child', (await call('DELETE', `/children/${newChildId}`, { token: parent })).status === 200);
  }

  // ------------------------------------------------------- CATEGORIES
  section('Categories');

  const cats = await call('GET', '/categories', { token: parent });
  check('categories list', (cats.json?.data?.length ?? 0) === 9, cats.json?.data?.length);

  const newCat = await call('POST', '/categories', {
    token: admin,
    body: { name: 'Kasblar', icon: '👷', color: '#0ea5e9' },
  });
  check('admin creates category with auto slug', newCat.json?.data?.slug === 'kasblar', newCat.json);

  check(
    'duplicate category -> 400',
    (await call('POST', '/categories', { token: admin, body: { name: 'Kasblar' } })).status === 400,
  );
  check('parent cannot create category', (await call('POST', '/categories', { token: parent, body: { name: 'X' } })).status === 403);

  if (newCat.json?.data?.id) {
    check('delete empty category', (await call('DELETE', `/categories/${newCat.json.data.id}`, { token: admin })).status === 200);
  }

  const ranglar = cats.json?.data?.find(c => c.slug === 'ranglar');
  check(
    'category with lessons cannot be deleted',
    (await call('DELETE', `/categories/${ranglar.id}`, { token: admin })).status === 400,
  );

  // ---------------------------------------------------------- LESSONS
  section('Lessons');

  const forMe = await call('GET', '/lessons/for-me', { token: child });
  check('child sees only own age group', forMe.json?.data?.ageGroup === 'AGE_3_4', forMe.json?.data?.ageGroup);
  check(
    'lessons carry progress',
    forMe.json?.data?.items?.every(l => l.progress && l.ageGroup === 'AGE_3_4'),
    forMe.json?.data?.items?.[0],
  );

  const harflar = cats.json?.data?.find(c => c.slug === 'harflar');
  const newLesson = await call('POST', '/lessons', {
    token: admin,
    body: {
      title: 'Test darsi',
      description: 'smoke test',
      categoryId: harflar.id,
      ageGroup: 'AGE_3_4',
      points: 25,
      media: [{ type: 'IMAGE', url: 'https://example.com/a.png', caption: 'rasm', order: 0 }],
    },
  });
  check('admin creates lesson with media', newLesson.json?.data?.media?.length === 1, newLesson.json);
  const lessonId = newLesson.json?.data?.id;

  const notif = await call('GET', '/notifications/paginated?type=NEW_LESSON', { token: parent });
  check('NEW_LESSON notification sent to parent', (notif.json?.data?.count ?? 0) >= 1, notif.json?.data?.count);

  const searchLesson = await call('GET', '/lessons/paginated?search=Test', { token: admin });
  check('lesson search', (searchLesson.json?.data?.count ?? 0) >= 1);

  const filterLesson = await call('GET', '/lessons/paginated?ageGroup=AGE_1_2', { token: parent });
  check(
    'lesson age filter',
    filterLesson.json?.data?.items?.every(l => l.ageGroup === 'AGE_1_2'),
    filterLesson.json?.data?.items?.length,
  );

  // progress
  const progress1 = await call('POST', `/lessons/${lessonId}/progress`, {
    token: child,
    body: { progressPercent: 50, watchedSeconds: 30 },
  });
  check('partial progress, no points', progress1.json?.data?.pointsEarned === 0, progress1.json?.data);

  const progress2 = await call('POST', `/lessons/${lessonId}/progress`, {
    token: child,
    body: { status: 'COMPLETED', watchedSeconds: 120 },
  });
  check('completing lesson awards points', progress2.json?.data?.pointsEarned === 25, progress2.json?.data);

  const progress3 = await call('POST', `/lessons/${lessonId}/progress`, {
    token: child,
    body: { status: 'COMPLETED' },
  });
  check('re-completing awards nothing', progress3.json?.data?.pointsEarned === 0, progress3.json?.data);

  // wrong age group
  const babyLesson = filterLesson.json?.data?.items?.[0];
  check(
    'lesson from another age group -> 400',
    (await call('POST', `/lessons/${babyLesson.id}/progress`, { token: child, body: { status: 'COMPLETED' } })).status === 400,
  );

  // ------------------------------------------------------------ GAMES
  section('Games');

  const gamesForMe = await call('GET', '/games/for-me', { token: child });
  check('child games are age matched', gamesForMe.json?.data?.items?.every(g => g.ageGroup === 'AGE_3_4'), gamesForMe.json?.data);
  const game = gamesForMe.json?.data?.items?.[0];

  const play = await call('GET', `/games/${game.id}/play`, { token: child });
  check('play returns items', (play.json?.data?.items?.length ?? 0) > 0, play.json);
  check(
    'play NEVER leaks correctValue',
    play.json?.data?.items?.every(i => !('correctValue' in i)),
    play.json?.data?.items?.[0],
  );

  const getGameAsChild = await call('GET', `/games/${game.id}`, { token: child });
  check('game detail hides items from child', !('items' in (getGameAsChild.json?.data ?? {})), Object.keys(getGameAsChild.json?.data ?? {}));

  const getGameAsAdmin = await call('GET', `/games/${game.id}`, { token: admin });
  check('game detail shows items to admin', Array.isArray(getGameAsAdmin.json?.data?.items));

  // to'g'ri javoblarni admin orqali olamiz va hammasini to'g'ri yuboramiz
  const items = getGameAsAdmin.json.data.items;
  const perfect = await call('POST', `/games/${game.id}/submit`, {
    token: child,
    body: {
      answers: items.map(i => ({ itemId: i.id, value: i.correctValue })),
      durationSeconds: 45,
    },
  });
  check('perfect submit -> 3 stars', perfect.json?.data?.session?.stars === 3, perfect.json?.data?.session);
  check('perfect submit -> 100%', perfect.json?.data?.percent === 100, perfect.json?.data?.percent);
  // Medal bir marta beriladi, shuning uchun qayta yugurtirishda ro'yxatdan tekshiramiz.
  const awardsAfterPerfect = await call('GET', '/progress/me/awards', { token: child });
  check(
    'PERFECT_GAME award granted',
    awardsAfterPerfect.json?.data?.earned?.some(a => a.code === 'PERFECT_GAME'),
    awardsAfterPerfect.json?.data?.earned?.map(a => a.code),
  );

  const wrong = await call('POST', `/games/${game.id}/submit`, {
    token: child,
    body: { answers: items.map(i => ({ itemId: i.id, value: 'definitely-wrong' })), durationSeconds: 20 },
  });
  check('all wrong -> 0 stars', wrong.json?.data?.session?.stars === 0, wrong.json?.data?.session);

  const foreign = await call('POST', `/games/${game.id}/submit`, {
    token: child,
    body: { answers: [{ itemId: 'not-a-real-item', value: 'x' }] },
  });
  check('foreign item id -> 400', foreign.status === 400);

  const otherGroupGame = (await call('GET', '/games/paginated?ageGroup=AGE_1_2', { token: admin })).json?.data?.items?.[0];
  check(
    'playing another age group -> 400',
    (await call('GET', `/games/${otherGroupGame.id}/play`, { token: child })).status === 400,
  );

  // admin item CRUD
  const addItem = await call('POST', `/games/${game.id}/items`, {
    token: admin,
    body: {
      promptText: 'Test savol',
      correctValue: 'a',
      options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
    },
  });
  check('admin adds game item', addItem.status === 200 || addItem.status === 201, addItem.json);

  const badItem = await call('POST', `/games/${game.id}/items`, {
    token: admin,
    body: { promptText: 'X', correctValue: 'zzz', options: [{ value: 'a' }] },
  });
  check('correctValue must match an option -> 400', badItem.status === 400, badItem.json);

  if (addItem.json?.data?.id) {
    check(
      'admin deletes game item',
      (await call('DELETE', `/games/${game.id}/items/${addItem.json.data.id}`, { token: admin })).status === 200,
    );
  }

  // -------------------------------------------------------- PROGRESS
  section('Progress & awards');

  const myProgress = await call('GET', '/progress/me', { token: child });
  check('child progress', myProgress.json?.data?.stats?.totalPoints > 0, myProgress.json?.data?.stats);
  check('streak counted', myProgress.json?.data?.stats?.streakDays >= 7, myProgress.json?.data?.stats?.streakDays);

  const myAwards = await call('GET', '/progress/me/awards', { token: child });
  check('awards earned + locked', (myAwards.json?.data?.earned?.length ?? 0) > 0 && Array.isArray(myAwards.json?.data?.locked));

  const parentViewsProgress = await call('GET', `/children/${zilola.id}/progress`, { token: parent });
  check('parent sees child progress', parentViewsProgress.status === 200);

  const otherChild = children.find(c => c.fullName === 'Amirbek');
  check(
    'child cannot read sibling progress',
    (await call('GET', `/children/${otherChild.id}/progress`, { token: child })).status === 403,
  );

  // ------------------------------------------------------- DASHBOARD
  section('Dashboard');

  const dash = await call('GET', `/dashboard/parent?childId=${zilola.id}`, { token: parent });
  check('parent dashboard', dash.status === 200, dash.json);
  check('weekly chart has 7 days', dash.json?.data?.weekly?.days?.length === 7, dash.json?.data?.weekly?.days?.length);
  check('monthly chart has 30 days', dash.json?.data?.monthly?.days?.length === 30, dash.json?.data?.monthly?.days?.length);
  check('today reflected', dash.json?.data?.today?.gamesPlayed >= 2, dash.json?.data?.today);
  check('best subjects computed', (dash.json?.data?.bestSubjects?.length ?? 0) > 0, dash.json?.data?.bestSubjects);

  const dashDefault = await call('GET', '/dashboard/parent', { token: parent });
  check('dashboard defaults to first child', dashDefault.status === 200, dashDefault.json?.data?.child?.fullName);

  const adminDash = await call('GET', '/dashboard/admin', { token: admin });
  check('admin dashboard totals', adminDash.json?.data?.totals?.children >= 3, adminDash.json?.data?.totals);
  check('admin activity chart 14 days', adminDash.json?.data?.activityChart?.length === 14);
  check('children grouped by age', adminDash.json?.data?.childrenByAgeGroup?.AGE_3_4 >= 1, adminDash.json?.data?.childrenByAgeGroup);

  const board = await call('GET', '/dashboard/leaderboard?period=all&limit=5', { token: parent });
  check('leaderboard ranked', board.json?.data?.[0]?.rank === 1, board.json?.data);

  const weekBoard = await call('GET', '/dashboard/leaderboard?period=week', { token: parent });
  check('weekly leaderboard', Array.isArray(weekBoard.json?.data), weekBoard.json);

  const groupBoard = await call('GET', '/dashboard/leaderboard?ageGroup=AGE_3_4', { token: parent });
  check(
    'leaderboard age filter',
    groupBoard.json?.data?.every(r => r.child.ageGroup === 'AGE_3_4'),
    groupBoard.json?.data?.map(r => r.child.ageGroup),
  );

  // --------------------------------------------------- NOTIFICATIONS
  section('Notifications');

  const list = await call('GET', '/notifications/paginated', { token: parent });
  check('parent notifications', (list.json?.data?.count ?? 0) > 0, list.json?.data?.count);
  check('unread counter', typeof list.json?.data?.unread === 'number');

  const first = list.json?.data?.items?.[0];
  if (first) {
    check('mark read', (await call('PUT', `/notifications/${first.id}/read`, { token: parent })).status === 200);
  }
  check('mark all read', (await call('PUT', '/notifications/read-all', { token: parent })).status === 200);

  const afterRead = await call('GET', '/notifications/paginated?unreadOnly=true', { token: parent });
  check('unreadOnly filter empty after read-all', afterRead.json?.data?.count === 0, afterRead.json?.data?.count);

  const digest = await call('POST', '/notifications/daily-digest', { token: admin });
  check('daily digest runs', digest.status === 200, digest.json);

  const digestAgain = await call('POST', '/notifications/daily-digest', { token: admin });
  check('digest is idempotent per day', digestAgain.json?.data?.sent === 0, digestAgain.json?.data);

  // ------------------------------------------------------------ MEDIA
  section('Media');

  const reg = await call('POST', '/media', {
    token: admin,
    body: {
      type: 'IMAGE',
      url: 'https://bucket.s3.amazonaws.com/a.png',
      key: 'uploads/a.png',
      originalName: 'a.png',
      mimeType: 'image/png',
      size: 1024,
    },
  });
  check('register media asset', reg.status === 200 || reg.status === 201, reg.json);

  const mediaList = await call('GET', '/media/paginated?type=IMAGE', { token: admin });
  check('media list filtered by type', (mediaList.json?.data?.count ?? 0) === 1, mediaList.json?.data?.count);

  if (reg.json?.data?.id) {
    const del = await call('DELETE', `/media/${reg.json.data.id}`, { token: admin });
    check('delete returns s3 key', del.json?.data?.key === 'uploads/a.png', del.json);
  }

  check('parent cannot list media', (await call('GET', '/media/paginated', { token: parent })).status === 403);

  // ----------------------------------------------------------- LOGOUT
  section('Logout');

  check('logout', (await call('POST', '/auth/logout', { token: parent })).status === 200);
  check('revoked token -> 401', (await call('GET', '/auth/me', { token: parent })).status === 401);

  // ---------------------------------------------------------- SUMMARY
  console.log(`\n${'='.repeat(50)}`);
  console.log(`PASS: ${pass}   FAIL: ${fail}`);
  if (failures.length) {
    console.log('\nFailed checks:');
    failures.forEach(f => console.log(`  - ${f}`));
  }
  process.exit(fail ? 1 : 0);
})().catch(err => {
  console.error('\nSMOKE TEST CRASHED:', err);
  process.exit(1);
});
