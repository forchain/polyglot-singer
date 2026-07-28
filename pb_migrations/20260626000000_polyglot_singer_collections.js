migrate(
	(app) => {
		const users = app.findCollectionByNameOrId('users');

		users.fields.add(new Field({ type: 'text', name: 'username' }));
		users.fields.add(new Field({ type: 'text', name: 'displayName' }));
		users.passwordAuth.enabled = true;
		users.passwordAuth.identityFields = ['email'];
		app.save(users);

		const analyzedLyrics = new Collection({
			type: 'base',
			name: 'analyzed_lyrics',
			listRule: 'isPublic = true || user = @request.auth.id',
			viewRule: 'isPublic = true || user = @request.auth.id',
			createRule: '@request.auth.id != "" && user = @request.auth.id',
			updateRule: 'user = @request.auth.id',
			deleteRule: 'user = @request.auth.id',
			fields: [
				{ type: 'relation', name: 'user', required: true, collectionId: users.id, maxSelect: 1 },
				{ type: 'text', name: 'title' },
				{ type: 'text', name: 'artist' },
				{ type: 'editor', name: 'lyrics', required: true },
				{ type: 'text', name: 'sourceLanguage', required: true },
				{ type: 'text', name: 'targetLanguage', required: true },
				{ type: 'json', name: 'analysisJson', required: true },
				{ type: 'text', name: 'voice' },
				{ type: 'bool', name: 'isPublic' }
			]
		});
		app.save(analyzedLyrics);

		const userPreferences = new Collection({
			type: 'base',
			name: 'user_preferences',
			listRule: 'user = @request.auth.id',
			viewRule: 'user = @request.auth.id',
			createRule: 'user = @request.auth.id',
			updateRule: 'user = @request.auth.id',
			deleteRule: 'user = @request.auth.id',
			fields: [
				{ type: 'relation', name: 'user', required: true, collectionId: users.id, maxSelect: 1 },
				{ type: 'text', name: 'preferredSourceLanguage' },
				{ type: 'text', name: 'preferredTargetLanguage' },
				{ type: 'text', name: 'phoneticStyle' },
				{ type: 'bool', name: 'showPinyin' },
				{ type: 'bool', name: 'autoSave' },
				{ type: 'json', name: 'defaultVoices' }
			],
			indexes: ['CREATE UNIQUE INDEX idx_user_preferences_user ON user_preferences (user)']
		});
		app.save(userPreferences);

		const wordGrammarAnalysis = new Collection({
			type: 'base',
			name: 'word_grammar_analysis',
			listRule: '',
			viewRule: '',
			createRule: null,
			updateRule: null,
			deleteRule: null,
			fields: [
				{ type: 'text', name: 'word', required: true },
				{ type: 'text', name: 'language', required: true },
				{ type: 'text', name: 'partOfSpeech' },
				{ type: 'json', name: 'grammarRules' },
				{ type: 'json', name: 'examples' },
				{ type: 'json', name: 'analysisJson', required: true }
			],
			indexes: [
				'CREATE UNIQUE INDEX idx_word_grammar_analysis_word_language ON word_grammar_analysis (word, language)'
			]
		});
		app.save(wordGrammarAnalysis);
	},
	(app) => {
		for (const name of ['word_grammar_analysis', 'user_preferences', 'analyzed_lyrics']) {
			const collection = app.findCollectionByNameOrId(name);
			if (collection) {
				app.delete(collection);
			}
		}

		const users = app.findCollectionByNameOrId('users');
		if (users) {
			for (const fieldName of ['username', 'displayName']) {
				const field = users.fields.getByName(fieldName);
				if (field) {
					users.fields.remove(field.id);
				}
			}
			app.save(users);
		}
	}
);
