"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skolengo = exports.REDIRECT_URI = exports.OID_CLIENT_SECRET = exports.OID_CLIENT_ID = exports.BASE_URL = void 0;
const axios_1 = __importDefault(require("axios"));
const jsonapi_fractal_1 = require("jsonapi-fractal");
const base_64_1 = require("base-64");
const Calendar_1 = require("./models/Calendar");
const SchoolLife_1 = require("./models/SchoolLife");
const Errors_1 = require("./models/Errors");
exports.BASE_URL = 'https://api.skolengo.com/api/v1/bff-sko-app';
exports.OID_CLIENT_ID = (0, base_64_1.decode)('U2tvQXBwLlByb2QuMGQzNDkyMTctOWE0ZS00MWVjLTlhZjktZGY5ZTY5ZTA5NDk0'); // base64 du client ID de l'app mobile
exports.OID_CLIENT_SECRET = (0, base_64_1.decode)('N2NiNGQ5YTgtMjU4MC00MDQxLTlhZTgtZDU4MDM4NjkxODNm'); // base64 du client Secret de l'app mobile
exports.REDIRECT_URI = 'skoapp-prod://sign-in-callback';
class Skolengo {
    school;
    tokenSet;
    oidClient;
    config;
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
    constructor(oidClient, school, tokenSet, config) {
        this.oidClient = oidClient;
        this.school = school;
        this.tokenSet = tokenSet;
        this.config = {
            httpClient: config?.httpClient ?? axios_1.default.create({ baseURL: exports.BASE_URL }),
            onTokenRefresh: config?.onTokenRefresh ?? (() => { }),
            refreshToken: config?.refreshToken,
            handlePronoteError: config?.handlePronoteError ?? false
        };
    }
    /**
     * Révoquer un jeton
     * @param {Client} oidClient Un client OpenID Connect
     * @param {string} token Un jeton
     * @async
     */
    static async revokeToken(oidClient, token) {
        return await oidClient.revoke(token);
    }
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
    static async getAppCurrentConfig(httpConfig) {
        return (0, jsonapi_fractal_1.deserialize)((await axios_1.default.request({
            baseURL: exports.BASE_URL,
            url: '/sko-app-configs/current',
            method: 'get',
            responseType: 'json',
            ...httpConfig
        })).data);
    }
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
    static async searchSchool(filter, limit = 10, offset = 0, httpConfig) {
        return (0, jsonapi_fractal_1.deserialize)((await axios_1.default.request({
            baseURL: exports.BASE_URL,
            url: '/schools',
            method: 'get',
            responseType: 'json',
            params: {
                page: {
                    limit,
                    offset
                },
                filter
            },
            ...httpConfig
        })).data);
    }
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
    /**
     * Informations sur l'utilisateur actuellement authentifié (nom, prénom, date de naissance, adresse postale, courriel, téléphone, permissions, ...)
     * @param {string|undefined} userId Identifiant de l'utilisateur
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getUserInfo(userId, params, includes = ['school', 'students', 'students.school', 'schools', 'prioritySchool']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `/users-info/${userId ?? this.getTokenClaims().sub}`,
            responseType: 'json',
            params: {
                /*
                              fields: {
                                userInfo: 'lastName,firstName,photoUrl,externalMail,mobilephone,permissions',
                                school: 'name,timeZone,subscribedServices',
                                legalRepresentativeUserInfo: 'addressLines,postalCode,city,country,students',
                                studentUserInfo: 'className,dateOfBirth,regime,school',
                                student: 'firstName,lastName,photoUrl,className,dateOfBirth,regime,school'
                              },
                              */
                ...params,
                include: includes.join(',')
            }
        })).data);
    }
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
    async downloadAttachment(attachment) {
        return (await this.request({
            url: attachment.url,
            responseType: 'stream'
        })).data;
    }
    /**
     * Récupérer toutes les actualités de l'établissement
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getSchoolInfos(params, includes = ['illustration', 'school', 'author', 'author.person', 'author.technicalUser', 'attachments']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/schools-info',
            responseType: 'json',
            params: {
                include: includes.join(','),
                ...params
            }
        })).data);
    }
    /**
     * Récupérer une actualité de l'établissement
     * @param {string} schoolInfoId Identifiant d'une actualité
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getSchoolInfo(schoolInfoId = this.school.id, params, includes = ['illustration', 'school', 'author', 'author.person', 'author.technicalUser', 'attachments']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `/schools-info/${schoolInfoId}`,
            responseType: 'json',
            params: {
                include: includes.join(','),
                ...params
            }
        })).data);
    }
    /**
     * Statut des services d'évaluation (identifiant des périodes, ...)
     * @param {string} studentId Identifiant d'un étudiant
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getEvaluationSettings(studentId = this.getTokenClaims().sub, limit = 20, offset = 0, params, includes = ['periods', 'skillsSetting', 'skillsSetting.skillAcquisitionColors']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/evaluations-settings',
            responseType: 'json',
            params: {
                filter: {
                    'student.id': studentId
                },
                page: {
                    limit,
                    offset
                },
                include: includes.join(','),
                ...params
                /*
                              fields: {
                                evaluationsSetting: 'periodicReportsEnabled,skillsEnabled,evaluationsDetailsAvailable',
                                period: 'label,startDate,endDate',
                                skillsSetting: 'skillAcquisitionLevels,skillAcquisitionColors',
                                skillAcquisitionColors: 'colorLevelMappings'
                              }
                              */
            }
        })).data);
    }
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
    async getEvaluation(studentId = this.getTokenClaims().sub, periodId, limit = 20, offset = 0, params, includes = ['subject', 'evaluations', 'evaluations.evaluationResult', 'evaluations.evaluationResult.subSkillsEvaluationResults', 'evaluations.evaluationResult.subSkillsEvaluationResults.subSkill', 'evaluations.subSkills', 'teachers']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/evaluation-services',
            responseType: 'json',
            params: {
                filter: {
                    'student.id': studentId,
                    'period.id': periodId
                },
                page: {
                    limit,
                    offset
                },
                include: includes.join(','),
                ...params
                /*
                              fields: {
                                evaluationService: 'coefficient,average,studentAverage,scale',
                                subject: 'label,color',
                                evaluation: 'dateTime,coefficient,average,scale,evaluationResult,subSkills',
                                evaluationResult: 'mark,nonEvaluationReason,subSkillsEvaluationResults',
                                subSkillEvaluationResult: 'level,subSkill',
                                teacher: 'firstName,lastName,title',
                                subSkill: 'shortLabel'
                              }
                              */
            }
        })).data);
    }
    /**
     * Récupérer le détail d'une note d'un étudiant
     * @param {string} studentId Identifiant d'un étudiant
     * @param {string} evaluationId Identifiant de la note
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getEvaluationDetail(studentId = this.getTokenClaims().sub, evaluationId, params, includes = ['evaluationService', 'evaluationService.subject', 'evaluationService.teachers', 'subSubject', 'subSkills', 'evaluationResult', 'evaluationResult.subSkillsEvaluationResults', 'evaluationResult.subSkillsEvaluationResults.subSkill']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `/evaluations/${evaluationId}`,
            responseType: 'json',
            params: {
                filter: {
                    'student.id': studentId
                },
                include: includes.join(','),
                ...params
                /*
                              fields: {
                                evaluationService: 'subject,teachers',
                                subject: 'label,color',
                                subSubject: 'label',
                                evaluation: 'title,topic,dateTime,coefficient,min,max,average,scale',
                                evaluationResult: 'subSkillsEvaluationResults,nonEvaluationReason,mark,comment',
                                subSkill: 'shortLabel',
                                subSkillEvaluationResult: 'level,subSkill',
                                teacher: 'firstName,lastName,title'
                              }
                              */
            }
        })).data);
    }
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
    async getPeriodicReportsFiles(studentId = this.getTokenClaims().sub, limit = 20, offset = 0, params, includes = ['period']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/periodic-reports-files',
            responseType: 'json',
            params: {
                filter: {
                    'student.id': studentId
                },
                include: includes.join(','),
                page: {
                    limit,
                    offset
                },
                ...params
                /*
                          fields: {
                            periodicReportFile: 'name,mimeType,size,url,mimeTypeLabel'
                          }
                           */
            }
        })).data);
    }
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
    async getAgenda(studentId = this.getTokenClaims().sub, startDate, endDate, limit = 20, offset = 0, params, includes = ['lessons', 'lessons.subject', 'lessons.teachers', 'homeworkAssignments', 'homeworkAssignments.subject']) {
        return new Calendar_1.AgendaResponse((0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/agendas',
            responseType: 'json',
            params: {
                include: includes.join(','),
                filter: {
                    'student.id': studentId,
                    date: {
                        GE: startDate,
                        LE: endDate
                    }
                },
                page: {
                    limit,
                    offset
                },
                ...params
                /*
                          fields: {
                            lesson: 'title,startDateTime,endDateTime,location,canceled,subject,teachers',
                            homework: 'title,done,dueDateTime,subject',
                            cateringService: 'title,startDateTime,endDateTime',
                            teacher: 'firstName,lastName,title',
                            subject: 'label,color'
                          }
                           */
            }
        })).data));
    }
    /**
     * Récupérer les données d'un cours/leçon
     * @param {string} studentId Identifiant d'un étudiant
     * @param {string} lessonId Identifiant d'un cours/leçon
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getLesson(studentId = this.getTokenClaims().sub, lessonId, params, includes = ['teachers', 'contents', 'contents.attachments', 'subject', 'toDoForTheLesson', 'toDoForTheLesson.subject', 'toDoAfterTheLesson', 'toDoAfterTheLesson.subject']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `/lessons/${lessonId}`,
            responseType: 'json',
            params: {
                include: includes.join(','),
                filter: {
                    'student.id': studentId
                },
                ...params
            }
        })).data);
    }
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
    async getHomeworkAssignments(studentId = this.getTokenClaims().sub, startDate, endDate, limit = 20, offset = 0, params, includes = ['subject', 'teacher', 'teacher.person']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/homework-assignments',
            responseType: 'json',
            params: {
                include: includes.join(','),
                filter: {
                    'student.id': studentId,
                    dueDate: {
                        GE: startDate,
                        LE: endDate
                    }
                },
                page: {
                    limit,
                    offset
                },
                fields: {
                    homework: 'title,done,dueDateTime,html',
                    subject: 'label,color'
                },
                ...params
            }
        })).data);
    }
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
    async getHomeworkAssignment(studentId = this.getTokenClaims().sub, homeworkId, params, includes = ['subject', 'teacher', 'pedagogicContent', 'individualCorrectedWork', 'individualCorrectedWork.attachments', 'individualCorrectedWork.audio', 'commonCorrectedWork', 'commonCorrectedWork.attachments', 'commonCorrectedWork.audio', 'commonCorrectedWork.pedagogicContent', 'attachments', 'audio', 'teacher.person']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `/homework-assignments/${homeworkId}`,
            responseType: 'json',
            params: {
                include: includes.join(','),
                filter: {
                    'student.id': studentId
                },
                fields: {
                    homework: 'title,done,dueDateTime,html',
                    subject: 'label,color'
                },
                ...params
            }
        })).data);
    }
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
    async patchHomeworkAssignment(studentId = this.getTokenClaims().sub, homeworkId, attributes, params, includes = ['subject', 'teacher', 'pedagogicContent', 'individualCorrectedWork', 'individualCorrectedWork.attachments', 'individualCorrectedWork.audio', 'commonCorrectedWork', 'commonCorrectedWork.attachments', 'commonCorrectedWork.audio', 'commonCorrectedWork.pedagogicContent', 'attachments', 'audio', 'teacher.person']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            method: 'patch',
            url: `/homework-assignments/${homeworkId}`,
            responseType: 'json',
            params: {
                include: includes.join(','),
                filter: {
                    'student.id': studentId
                },
                ...params
            },
            data: {
                data: {
                    type: 'homework',
                    id: homeworkId,
                    attributes
                }
            }
        })).data);
    }
    /**
     * Récupérer les informations du service de communication (identifiants des dossiers, ...)
     * @param {string|undefined} userId Identifiant d'un utilisateur
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getUsersMailSettings(userId, params, includes = ['signature', 'folders', 'folders.parent', 'contacts', 'contacts.person', 'contacts.personContacts']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `/users-mail-settings/${userId ?? this.getTokenClaims().sub}`,
            params: {
                include: includes.join(','),
                ...params
                /*
                                fields: {
                                  personContact: 'person,linksWithUser',
                                  groupContact: 'label,personContacts,linksWithUser',
                                  person: 'firstName,lastName,title,photoUrl',
                                  userMailSetting: 'maxCharsInParticipationContent,maxCharsInCommunicationSubject',
                                  signature: 'content',
                                  folder: 'name,position,type,parent'
                                }
                                */
            },
            responseType: 'json'
        })).data);
    }
    /**
     * Récupérer les communication d'un dossier
     * @param {string} folderId Identifiant d'un dossier
     * @param {number} limit Limite
     * @param {number} offset Offset
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getCommunicationsFolder(folderId, limit = 10, offset = 0, params, includes = ['lastParticipation', 'lastParticipation.sender', 'lastParticipation.sender.person', 'lastParticipation.sender.technicalUser']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/communications',
            responseType: 'json',
            params: {
                filter: {
                    'folders.id': folderId
                },
                include: includes.join(','),
                page: {
                    limit,
                    offset
                },
                ...params
            }
        })).data);
    }
    /**
     * Récupérer une communication à partir de son identifiant.
     * @param {string} communicationId Identifiant d'une communication
     * @param {object} params Modifier les paramètres de la requête
     * @async
     */
    async getCommunication(communicationId, params) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `communications/${communicationId}`,
            params,
            responseType: 'json'
        })).data);
    }
    /**
     * Récupérer les participations d'un fil de discussion (communication)
     * Marque la communication comme lue.
     * @param {string} communicationId Identifiant d'une communication
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getCommunicationParticipations(communicationId, params, includes = ['sender', 'sender.person', 'sender.technicalUser', 'attachments']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `communications/${communicationId}/participations`,
            responseType: 'json',
            params: {
                include: includes.join(','),
                ...params
            }
        })).data);
    }
    /**
     * Récupérer tous les participants d'un fil de discussion (communication)
     * @param {string} communicationId Identifiant d'une communication
     * @param {boolean} fromGroup Afficher le détail des groupes
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getCommunicationParticipants(communicationId, fromGroup = true, params, includes = ['person', 'technicalUser']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `communications/${communicationId}/participants`,
            responseType: 'json',
            params: {
                include: includes.join(','),
                filter: { fromGroup },
                ...params
            }
        })).data);
    }
    /**
     * Déplacer une communication dans un dossier
     * @param {string} communicationId Identifiant d'une communication
     * @param folders Liste contenant l'identifiant du dossier
     * @param {string|undefined} userId Identifiant de l'utilisateur
     * @param {object} params Modifier les paramètres de la requête
     * @async
     */
    async patchCommunicationFolders(communicationId, folders, userId, params) {
        return (await this.request({
            url: `communications/${communicationId}/relationships/folders`,
            method: 'patch',
            responseType: 'json',
            params: {
                filter: {
                    'user.id': userId ?? this.getTokenClaims().sub
                },
                ...params
            },
            data: { data: folders }
        })).data;
    }
    /**
     * Envoyer un message dans un nouveau fil de discussion
     * @param {Partial<Communication>} newCommunication La nouvelle communication
     * @param {object} params Modifier les paramètres de la requête
     * @async
     */
    async postCommunication(newCommunication, params) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: 'communications',
            method: 'post',
            params,
            responseType: 'json',
            data: {
                data: newCommunication
            }
        })).data);
    }
    /**
     * Envoyer un message dans un fil de discussion existant
     * @param {Partial<Participation>} participation La nouvelle participation
     * @param {object} params Modifier les paramètres de la requête
     * @async
     */
    async postParticipation(participation, params) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: 'participations',
            method: 'post',
            responseType: 'json',
            params,
            data: {
                data: participation
            }
        })).data);
    }
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
    async getAbsenceFiles(studentId = this.getTokenClaims().sub, limit = 20, offset = 0, params, includes = ['currentState', 'currentState.absenceReason', 'currentState.absenceRecurrence']) {
        return new SchoolLife_1.AbsenceFilesResponse((0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/absence-files',
            responseType: 'json',
            params: {
                filter: {
                    'student.id': studentId
                },
                page: {
                    limit,
                    offset
                },
                include: includes.join(','),
                ...params
            }
        })).data));
    }
    /**
     * Récupérer les détails d'une absence
     * @param {string} folderId Identifiant d'un dossier
     * @param {object} params Modifier les paramètres de la requête
     * @param {string[]} includes Ressources JSON:API à inclure
     * @async
     */
    async getAbsenceFile(folderId, params, includes = ['currentState', 'currentState.absenceReason', 'currentState.absenceRecurrence', 'history', 'history.creator']) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: `/absence-files/${folderId}`,
            responseType: 'json',
            params: {
                include: includes,
                ...params
            }
        })).data);
    }
    /**
     * Justifier une absence avec motif et commentaire.
     * _PS: La requête n'a pas été testée._
     * @param {string} folderId Identifiant d'un dossier
     * @param {string} reasonId Identifiant d'un motif
     * @param {string} comment Commentaire
     * @param {object} params Modifier les paramètres de la requête
     */
    async postAbsenceFileState(folderId, reasonId, comment, params) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/absence-files-states',
            responseType: 'json',
            params,
            data: (0, jsonapi_fractal_1.serialize)({
                comment,
                absenceFile: {
                    id: folderId
                },
                absenceReason: {
                    id: reasonId
                }
            }, 'absenceFileState', {
                relationships: ['absenceFile', 'absenceReason']
            })
        })).data);
    }
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
    async getAbsenceReasons(limit = 20, offset = 0, params) {
        return (0, jsonapi_fractal_1.deserialize)((await this.request({
            url: '/absence-reasons',
            responseType: 'json',
            params: {
                page: {
                    limit,
                    offset
                },
                ...params
            }
        })).data);
    }
    /**
     * Récupérer les données contenues dans le payload JWT du token ID
     */
    getTokenClaims() {
        if (this.tokenSet.id_token === undefined)
            throw new TypeError('id_token not present in TokenSet');
        const dataPart = this.tokenSet.id_token.split('.')?.at(1)?.replace(/-/g, '+').replace(/_/g, '/');
        if (dataPart === undefined || dataPart.trim().length === 0)
            throw new TypeError('Invalid id_token');
        return JSON.parse((0, base_64_1.decode)(dataPart));
    }
    /**
     * Gérer l'erreur *PRONOTE_RESOURCES_NOT_READY* obtenue lorsque Skolengo tente d'obtenir les dernières notes d'un élève.
     * Ce comportement peut être activé en modifiant le paramètre optionnel correspondant.
     * @param {AxiosRequestConfig} requestConfig
     * @param {number} maxRetries
     * @private
     */
    async onPronoteError(requestConfig, maxRetries = 5) {
        for (let i = 0; i < maxRetries - 1; i++) {
            try {
                return await this.config.httpClient.request(requestConfig);
            }
            catch (e) {
                const err = e;
                if (err.name !== 'PRONOTE_RESOURCES_NOT_READY')
                    throw err;
            }
        }
        return await this.config.httpClient.request(requestConfig);
    }
    /**
     * Effectuer une requête authentifiée auprès de l'API.
     * Si la requête échoue, on rafraichit le jeton et on retente.
     * @param {AxiosRequestConfig} config
     * @private
     */
    async request(config) {
        const axiosConfig = {
            ...config,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${this.tokenSet.access_token}`,
                'X-Skolengo-Date-Format': 'utc',
                'X-Skolengo-School-Id': this.school.id,
                'X-Skolengo-Ems-Code': this.school.emsCode
            }
        };
        try {
            return await this.config.httpClient.request(axiosConfig);
        }
        catch (e) {
            const error = e;
            const response = error.response;
            if (response === undefined)
                throw error;
            if (response.status === 401) {
                const newTokenSet = await this.refreshToken();
                return await this.config.httpClient.request({
                    ...axiosConfig,
                    headers: {
                        Authorization: `Bearer ${newTokenSet.access_token}`,
                        'X-Skolengo-Date-Format': 'utc',
                        'X-Skolengo-School-Id': this.school.id,
                        'X-Skolengo-Ems-Code': this.school.emsCode
                    }
                });
            }
            if (response.data.errors instanceof Array && response.data.errors.length > 0) {
                const [firstError] = response.data.errors;
                const skolengoError = new Errors_1.SkolengoError(firstError);
                if (this.config.handlePronoteError && skolengoError.name === 'PRONOTE_RESOURCES_NOT_READY')
                    return await this.onPronoteError(axiosConfig);
                throw skolengoError;
            }
            throw error;
        }
    }
}
exports.Skolengo = Skolengo;
