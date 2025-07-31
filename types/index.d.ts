/// <reference types="node" />
import type { AxiosRequestConfig } from 'axios';
import type { Client, IdTokenClaims, TokenSetParameters } from 'openid-client';
import type { Stream } from 'node:stream';
import type { AppCurrentConfig, BaseObject, User } from './models/Common';
import type { School, SchoolFilter } from './models/School/School';
import type { AuthConfig } from './models/Common/Auth';
import type { Communication, Participation, UsersMailSettings } from './models/Messaging';
import type { Attachment, SchoolInfo } from './models/School';
import type { Evaluation, EvaluationDetail, EvaluationSettings } from './models/Results';
import type { Lesson, HomeworkAssignment } from './models/Calendar';
import { AgendaResponse } from './models/Calendar';
import type { AbsenceFile, AbsenceState, AbsenceReason } from './models/SchoolLife';
import { AbsenceFilesResponse } from './models/SchoolLife';
import type { SkolengoConfig } from './models/Common/SkolengoConfig';
export declare const BASE_URL = "https://api.skolengo.com/api/v1/bff-sko-app";
export declare const OID_CLIENT_ID: string;
export declare const OID_CLIENT_SECRET: string;
export declare const REDIRECT_URI = "skoapp-prod://sign-in-callback";
export declare class Skolengo {
    readonly school: School;
    tokenSet: TokenSetParameters;
    private readonly oidClient;
    private readonly config;
    /**
     * Il est possible de s'authentifier en possédant au prélable des jetons OAuth 2.0
     *
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * // 🚨 ATTENTION: Ne communiquez jamais vos jetons à un tiers. Ils vous sont strictement personnels. Si vous pensez que vos jetons ont été dérobés, révoquez-les immédiatement.
     * // L'objet de configuration ci-dessous peut être généré à partir de l'utilitaire scolengo-token (https://github.com/maelgangloff/scolengo-token)
     * const config = {
     *   "tokenSet": {
     *     "access_token": "<access_token_here>",
     *     "id_token": "<id_token_here>",
     *     "refresh_token": "RT-<refresh_token_here>",
     *     "token_type": "bearer",
     *     "expires_at": 1234567890,
     *     "scope": "openid"
     *   },
     *   "school": {
     *     "id": "SKO-E-<school_id>",
     *     "name": "<school_name>",
     *     "addressLine1": "<school_address>",
     *     "addressLine2": null,
     *     "addressLine3": null,
     *     "zipCode": "<school_zip_code>",
     *     "city": "<school_city>",
     *     "country": "France",
     *     "homePageUrl": "<cas_login_url>",
     *     "emsCode": "<school_ems_code>",
     *     "emsOIDCWellKnownUrl": "<school_ems_oidc_well_known_url>"
     *   }
     * }
     * Skolengo.fromConfigObject(config).then(async user => {
     *   const infoUser = await user.getUserInfo()
     *   console.log(`Correctement authentifié sous l'identifiant ${infoUser.id}`)
     * })
     * ```
     * ```js
     * const {Skolengo} = require('scolengo-api')
     * const {TokenSet} = require('openid-client')
     *
     * Skolengo.searchSchool({ text: 'Lycée Louise Weiss' }).then(async schools => {
     *   if(!schools.length) throw new Error('Aucun établissement n\'a été trouvé.')
     *   const school = schools[0]
     *   const oidClient = await Skolengo.getOIDClient(school)
     *
     *   // 🚨 ATTENTION: Ne communiquez jamais vos jetons à un tiers. Ils vous sont strictement personnels. Si vous pensez que vos jetons ont été dérobés, révoquez-les immédiatement.
     *
     *   const tokenSet = new TokenSet({
     *     access_token: 'ACCESS_TOKEN',
     *     id_token: 'ID_TOKEN',
     *     refresh_token: 'REFRESH_TOKEN',
     *     token_type: 'bearer',
     *     expires_at: 1681486899,
     *     scope: 'openid'
     *   })
     *
     *   const user = new Skolengo(oidClient, school, tokenSet)
     *   const infoUser = await user.getUserInfo()
     *   console.log(`Correctement authentifié sous l'identifiant ${infoUser.id}`)
     * })
     * ```
     * @param {Client} oidClient Un client OpenID Connect
     * @param {School} school Etablissement
     * @param {TokenSetParameters} tokenSet Jetons d'authentification OpenID Connect
     * @param {SkolengoConfig} config Configuration optionnelle (stockage du jeton renouvellé, client HTTP personnalisé, gestion des erreurs Pronote, ...)
     */
    constructor(oidClient: Client | null, school: School, tokenSet: TokenSetParameters, config?: Partial<SkolengoConfig>);
    /**
     * Révoquer un jeton
     * @param {Client} oidClient Un client OpenID Connect
     * @param {string} token Un jeton
     * @async
     */
    static revokeToken(oidClient: Client, token: string): Promise<undefined>;
    /**
     * Configuration actuelle de l'application mobile (dernière version déployée, dernière version supportée, ...)
     * @param {AxiosRequestConfig|undefined} httpConfig Configuration facultative du client HTTP
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * Skolengo.getAppCurrentConfig().then(config => {
     *   console.log(`Dernière version déployée: ${config.latestDeployedSkoAppVersion}`)
     *   console.log(`Dernière version supportée: ${config.latestSupportedSkoAppVersion}`)
     * })
     * ```
     * @async
     */
    static getAppCurrentConfig(httpConfig?: AxiosRequestConfig): Promise<AppCurrentConfig>;
    /**
     * Rechercher un établissement scolaire
     * @param {SchoolFilter} filter Le filtre de recherche
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {AxiosRequestConfig|undefined} httpConfig Configuration facultative du client HTTP
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * Skolengo.searchSchool({ text: 'Lycée Louise Weiss' }).then(schools => {
     *   console.log(schools)
     * })
     * ```
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * Skolengo.searchSchool({ lat: 48.0, lon: 7.0 }).then(schools => {
     *   console.log(schools)
     * })
     * ```
     * @async
     */
    static searchSchool(filter: SchoolFilter, limit?: number, offset?: number, httpConfig?: AxiosRequestConfig): Promise<School[]>;
    /**
     * Créer un client OpenID Connect permettant l'obtention des jetons (refresh token et access token)
     * @param {School} school L'établissement scolaire
     * @param {string|undefined} redirectUri Callback
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * Skolengo.searchSchool({ text: 'Lycée Louise Weiss' }).then(async schools => {
     *   if(!schools.length) throw new Error('Aucun établissement n\'a été trouvé.')
     *   const school = schools[0]
     *   const oidClient = await Skolengo.getOIDClient(school, 'skoapp-prod://sign-in-callback')
     *   console.log(oidClient.authorizationUrl())
     *   // Lorsque l'authentification est effectuée, le CAS redirige vers le callback indiqué avec le code. Ce code permet d'obtenir les refresh token et access token (cf. mécanismes OAuth 2.0 et OID Connect)
     * })
     * ```
     * ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * Skolengo.searchSchool({ text: 'Lycée Louise Weiss' }).then(async schools => {
     *   if(!schools.length) throw new Error('Aucun établissement n\'a été trouvé.')
     *   const school = schools[0]
     *   const oidClient = await Skolengo.getOIDClient(school, 'skoapp-prod://sign-in-callback')
     *
     *   const params = oidClient.callbackParams('skoapp-prod://sign-in-callback?code=OC-9999-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X')
     *   const tokenSet = await oidClient.callback('skoapp-prod://sign-in-callback', params)
     *   // 🚨 ATTENTION: Ne communiquez jamais vos jetons à un tiers. Ils vous sont strictement personnels. Si vous pensez que vos jetons ont été dérobés, révoquez-les immédiatement.
     *
     *   const user = new Skolengo(oidClient, school, tokenSet)
     *   const infoUser = await user.getUserInfo()
     *   console.log(`Correctement authentifié sous l'identifiant ${infoUser.id}`)
     * })
     * ```
     */
    static getOIDClient(school: School, redirectUri?: string): Promise<Client>;
    /**
     * Créer un client Scolengo à partir d'un objet contenant les informations d'authentification.
     * Cet objet de configuration peut être généré à partir de l'utilitaire [scolengo-token](https://github.com/maelgangloff/scolengo-token).
     * Le callback optionnel `onTokenRefresh` est appellé lors du rafraichissement du jeton (pour éventuellement stocker en mémoire le nouveau tokenSet).
     * La callback optionnel `tokenRefresh` permet d'outrepasser l'utilisation de la librairie `openid-client` pour le rafraîchissement des jetons. La délégation de cette tâche permet l'utilisation de cette librairie dans des environnements externes à Node.js.
     * @param {AuthConfig} config Informations d'authentification
     * @param {SkolengoConfig} skolengoConfig Configuration optionnelle (stockage du jeton renouvellé, client HTTP personnalisé, gestion des erreurs Pronote, ...)
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     * const config = require('./config.json')
     * const user = await Skolengo.fromConfigObject(config)
     * ```
     * ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * // 🚨 ATTENTION: Ne communiquez jamais vos jetons à un tiers. Ils vous sont strictement personnels. Si vous pensez que vos jetons ont été dérobés, révoquez-les immédiatement.
     * const config = {
     *   "tokenSet": {
     *     "access_token": "<access_token_here>",
     *     "id_token": "<id_token_here>",
     *     "refresh_token": "RT-<refresh_token_here>",
     *     "token_type": "bearer",
     *     "expires_at": 1234567890,
     *     "scope": "openid"
     *   },
     *   "school": {
     *     "id": "SKO-E-<school_id>",
     *     "name": "<school_name>",
     *     "addressLine1": "<school_address>",
     *     "addressLine2": null,
     *     "addressLine3": null,
     *     "zipCode": "<school_zip_code>",
     *     "city": "<school_city>",
     *     "country": "France",
     *     "homePageUrl": "<cas_login_url>",
     *     "emsCode": "<school_ems_code>",
     *     "emsOIDCWellKnownUrl": "<school_ems_oidc_well_known_url>"
     *   }
     * }
     * Skolengo.fromConfigObject(config).then(async user => {
     *   const infoUser = await user.getUserInfo()
     *   console.log(`Correctement authentifié sous l'identifiant ${infoUser.id}`)
     * })
     * ```
     */
    static fromConfigObject(config: AuthConfig, skolengoConfig?: Partial<SkolengoConfig>): Promise<Skolengo>;
    /**
     * Informations sur l'utilisateur actuellement authentifié (nom, prénom, date de naissance, adresse postale, courriel, téléphone, permissions, ...)
     * @param {string|undefined} userId Identifiant de l'utilisateur
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getUserInfo(userId?: string, params?: object, includes?: string[]): Promise<User>;
    /**
     * Télécharger une pièce jointe.
     *
     * Une pièce jointe peut être un fichier inclu dans un courriel, une actualité de l'établissement ou un bulletin périodique.
     *
     * > [!CAUTION]
     * > 🚨 ATTENTION: Dans cette requête, votre jeton est envoyé à l'URL du fichier. Assurez-vous que celle-ci provient bien de votre établissement.
     * @async
     * @example ```js
     * const {createWriteStream} = require('node:fs')
     * const {Skolengo} = require('scolengo-api')
     *
     * Skolengo.fromConfigObject(config).then(async user => {
     *   const student = 'ESKO-P-b2c86113-1062-427e-bc7f-0618cbd5d5ec'
     *   const bulletins = await user.getPeriodicReportsFiles(student)
     *   for(const bulletin of bulletins) {
     *     console.log(bulletin.name)
     *     (await user.downloadAttachment(bulletin)).pipe(createWriteStream(bulletin.name));
     *   }
     * })
     * ```
     * @param {Attachment} attachment La pièce jointe
     */
    downloadAttachment(attachment: Attachment): Promise<Stream>;
    /**
     * Récupérer toutes les actualités de l'établissement
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getSchoolInfos(params?: object, includes?: string[]): Promise<SchoolInfo[]>;
    /**
     * Récupérer une actualité de l'établissement
     * @param {string} schoolInfoId Identifiant d'une actualité
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getSchoolInfo(schoolInfoId?: string, params?: object, includes?: string[]): Promise<SchoolInfo>;
    /**
     * Statut des services d'évaluation (identifiant des périodes, ...)
     * @param {string} studentId Identifiant d'un étudiant
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getEvaluationSettings(studentId?: string, limit?: number, offset?: number, params?: object, includes?: string[]): Promise<EvaluationSettings[]>;
    /**
     * Récupérer les notes d'un étudiant sur une période
     * @param {string} studentId Identifiant d'un étudiant
     * @param {string} periodId Identifiant de la période de notation
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getEvaluation(studentId: string | undefined, periodId: string, limit?: number, offset?: number, params?: object, includes?: string[]): Promise<Evaluation[]>;
    /**
     * Récupérer le détail d'une note d'un étudiant
     * @param {string} studentId Identifiant d'un étudiant
     * @param {string} evaluationId Identifiant de la note
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getEvaluationDetail(studentId: string | undefined, evaluationId: string, params?: object, includes?: string[]): Promise<EvaluationDetail>;
    /**
     * Récupérer la liste des bilans périodiques disponibles pour un étudiant.
     * Pour chaque bulletin, une adresse est disponible pour le téléchargement.
     * @param {string} studentId Identifiant d'un étudiant
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * Skolengo.fromConfigObject(config).then(async user => {
     *   const bulletins = await getPeriodicReportsFiles('ESKO-P-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx');
     *   console.log(bulletins)
     * })
     * ```
     */
    getPeriodicReportsFiles(studentId?: string, limit?: number, offset?: number, params?: object, includes?: string[]): Promise<Attachment[]>;
    /**
     * Récupérer l'agenda d'un étudiant.
     * Il est possible de le convertir au format iCalendar.
     * @param {string} studentId Identifiant d'un étudiant
     * @param {string} startDate Date de début - Format : YYYY-MM-DD
     * @param {string} endDate Date de fin - Format : YYYY-MM-DD
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     * @example ```js
     * const { writeFileSync } = require('node:fs')
     * const { Skolengo } = require('scolengo-api')
     *
     * Skolengo.fromConfigObject(config).then(async user => {
     *   const studentId = 'ESKO-P-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
     *   const agenda = await user.getAgenda(studentId, '2023-05-01', '2023-05-30')
     *
     *   writeFileSync('export.ics', agenda.toICalendar())
     * })
     * ```
     */
    getAgenda(studentId: string | undefined, startDate: string, endDate: string, limit?: number, offset?: number, params?: object, includes?: string[]): Promise<AgendaResponse>;
    /**
     * Récupérer les données d'un cours/leçon
     * @param {string} studentId Identifiant d'un étudiant
     * @param {string} lessonId Identifiant d'un cours/leçon
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getLesson(studentId: string | undefined, lessonId: string, params?: object, includes?: string[]): Promise<Lesson>;
    /**
     * Récupérer les devoirs d'un étudiant
     * @param {string} studentId Identifiant d'un étudiant
     * @param {string} startDate Date de début - Format : YYYY-MM-DD
     * @param {string} endDate Date de fin - Format : YYYY-MM-DD
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * Skolengo.fromConfigObject(config).then(async user => {
     *   const startDate = new Date().toISOString().split('T')[0] // Aujourd'hui
     *   const endDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1e3).toISOString().split('T')[0] // Aujourd'hui + 15 jours
     *   const homework = await user.getHomeworkAssignments(user.getTokenClaims().sub, startDate, endDate)
     *
     *   console.log("Voici les exercices à faire pour les 2 prochaines semaines :", homework)
     * })
     * ```
     * @async
     */
    getHomeworkAssignments(studentId: string | undefined, startDate: string, endDate: string, limit?: number, offset?: number, params?: object, includes?: string[]): Promise<HomeworkAssignment[]>;
    /**
     * Récupérer les données d'un devoir
     * @param {string} studentId Identifiant d'un étudiant
     * @param {string} homeworkId Identifiant du devoir
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * const user = await Skolengo.fromConfigObject(config)
     *
     * user.getHomeworkAssignment(user.getTokenClaims().sub, "123456").then(e => {
     *     console.log(`Pour le ${new Date(e.dueDateTime).toLocaleString()} :`)
     *     console.log(`> ${e.title} (${e.subject.label})`)
     *     console.log(e.html)
     * })
     *
     * ```
     * @async
     */
    getHomeworkAssignment(studentId: string | undefined, homeworkId: string, params?: object, includes?: string[]): Promise<HomeworkAssignment>;
    /**
     * Modifier le statut d'un travail à faire
     * @param {string} studentId Identifiant d'un étudiant
     * @param {string} homeworkId Identifiant d'un devoir à modifier
     * @param {Partial<HomeworkAssignment>} attributes Devoir modifié
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * const user = await Skolengo.fromConfigObject(config)
     * user.patchHomeworkAssignment('ESKO-P-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', '123456', { done: true }).then(hmw => {
     *   console.log(`Le travail "${hmw.title}" a été marqué ${hmw.done ? 'fait' : 'à faire'}.`)
     * })
     * ```
     * @async
     */
    patchHomeworkAssignment(studentId: string | undefined, homeworkId: string, attributes: Partial<HomeworkAssignment>, params?: object, includes?: string[]): Promise<HomeworkAssignment>;
    /**
     * Récupérer les informations du service de communication (identifiants des dossiers, ...)
     * @param {string|undefined} userId Identifiant d'un utilisateur
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getUsersMailSettings(userId?: string, params?: object, includes?: string[]): Promise<UsersMailSettings>;
    /**
     * Récupérer les communication d'un dossier
     * @param {string} folderId Identifiant d'un dossier
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getCommunicationsFolder(folderId: string, limit?: number, offset?: number, params?: object, includes?: string[]): Promise<Communication[]>;
    /**
     * Récupérer une communication à partir de son identifiant.
     * @param {string} communicationId Identifiant d'une communication
     * @param {object} params Modifier les paramètres de la requête
     * @async
     */
    getCommunication(communicationId: string, params?: object): Promise<Communication>;
    /**
     * Récupérer les participations d'un fil de discussion (communication)
     * Marque la communication comme lue.
     * @param {string} communicationId Identifiant d'une communication
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getCommunicationParticipations(communicationId: string, params?: object, includes?: string[]): Promise<Participation[]>;
    /**
     * Récupérer tous les participants d'un fil de discussion (communication)
     * @param {string} communicationId Identifiant d'une communication
     * @param {boolean} fromGroup Afficher le détail des groupes
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getCommunicationParticipants(communicationId: string, fromGroup?: boolean, params?: object, includes?: string[]): Promise<any>;
    /**
     * Déplacer une communication dans un dossier
     * @param {string} communicationId Identifiant d'une communication
     * @param folders Liste contenant l'identifiant du dossier
     * @param {string|undefined} userId Identifiant de l'utilisateur
     * @param {object} params Modifier les paramètres de la requête
     * @async
     */
    patchCommunicationFolders(communicationId: string, folders: Array<BaseObject<'folders'>>, userId?: string, params?: object): Promise<void>;
    /**
     * Envoyer un message dans un nouveau fil de discussion
     * @param {Partial<Communication>} newCommunication La nouvelle communication
     * @param {object} params Modifier les paramètres de la requête
     * @async
     */
    postCommunication(newCommunication: Partial<Communication>, params?: object): Promise<Communication>;
    /**
     * Envoyer un message dans un fil de discussion existant
     * @param {Partial<Participation>} participation La nouvelle participation
     * @param {object} params Modifier les paramètres de la requête
     * @async
     */
    postParticipation(participation: Partial<Participation>, params?: object): Promise<Participation>;
    /**
     * Récupérer les absences et retards d'un étudiant.
     * Il est possible d'exporter les absences au format CSV.
     * @param {string} studentId Identifiant d'un étudiant
     * @param {number} limit Limite
     * @param {offset} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     * @example ```js
     * const { writeFileSync } = require('node:fs')
     * const { Skolengo } = require('scolengo-api')
     *
     * Skolengo.fromConfigObject(config).then(async user => {
     *   const studentId = 'ESKO-P-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
     *   const absenceFiles = await user.getAbsenceFiles(studentId)
     *
     *   writeFileSync('export.csv', agenda.toCSV())
     * })
     * ```
     */
    getAbsenceFiles(studentId?: string, limit?: number, offset?: number, params?: object, includes?: string[]): Promise<AbsenceFilesResponse>;
    /**
     * Récupérer les détails d'une absence
     * @param {string} folderId Identifiant d'un dossier
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    getAbsenceFile(folderId: string, params?: object, includes?: string[]): Promise<AbsenceFile>;
    /**
     * Justifier une absence avec motif et commentaire.
     * _PS: La requête n'a pas été testée._
     * @param {string} folderId Identifiant d'un dossier
     * @param {string} reasonId Identifiant d'un motif
     * @param {string} comment Commentaire
     * @param {object} params Modifier les paramètres de la requête
     */
    postAbsenceFileState(folderId: string, reasonId: string, comment: string, params?: object): Promise<AbsenceState>;
    /**
     * Récupérer la liste des motifs possibles d'absence.
     * Cette liste peut être différente pour chaque établissement.
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @async
     * @example ```js
     * const {Skolengo} = require('scolengo-api')
     *
     * Skolengo.fromConfigObject(config).then(async user => {
     *   user.getAbsenceReasons().then(response => {
     *     console.log(`Liste des motifs: ${response.map(r => r.longLabel).join(';')}`)
     *   })
     * })
  
     * ```
     */
    getAbsenceReasons(limit?: number, offset?: number, params?: object): Promise<AbsenceReason[]>;
    /**
     * Demande un renouvellement du jeu de jeton (tokenSet)
     * @param {boolean} triggerListener Si oui, appeler la fonction onTokenRefresh
     */
    refreshToken(triggerListener?: boolean): Promise<TokenSetParameters>;
    /**
     * Récupérer les données contenues dans le payload JWT du token ID
     */
    getTokenClaims(): IdTokenClaims;
    /**
     * Gérer l'erreur *PRONOTE_RESOURCES_NOT_READY* obtenue lorsque Skolengo tente d'obtenir les dernières notes d'un élève.
     * Ce comportement peut être activé en modifiant le paramètre optionnel correspondant.
     * @param {AxiosRequestConfig} requestConfig
     * @param {number} maxRetries
     * @private
     */
    private onPronoteError;
    /**
     * Effectuer une requête authentifiée auprès de l'API.
     * Si la requête échoue, on rafraichit le jeton et on retente.
     * @param {AxiosRequestConfig} config
     * @private
     */
    private request;
}
