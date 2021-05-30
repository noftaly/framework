/// <reference types="node" />
import { Awaited, PieceOptions, Piece, PieceContext, AliasPiece, AliasPieceOptions, AliasStore, Store } from '@sapphire/pieces';
export { AliasPiece, AliasPieceOptions, AliasStore, Awaited, LoaderError, MissingExportsError, Piece, PieceContext, PieceOptions, Store, StoreOptions, container } from '@sapphire/pieces';
import { Message, Collection, CategoryChannel, Channel, DMChannel, GuildChannel, GuildMember, NewsChannel, Role, TextChannel, User, VoiceChannel, ClientOptions, ClientEvents, Client, PermissionResolvable } from 'discord.js';
import * as Lexure from 'lexure';
import { option } from 'lexure';
import { URL } from 'url';
import Collection$1 from '@discordjs/collection';
import { EventEmitter } from 'events';

/**
 * The UserError class to be emitted in the pieces.
 * @property name This will be `'UserError'` and can be used to distinguish the type of error when any error gets thrown
 */
declare class UserError extends Error {
    /**
     * An identifier, useful to localize emitted errors.
     */
    readonly identifier: string;
    /**
     * User-provided context.
     */
    readonly context: unknown;
    /**
     * Constructs an UserError.
     * @param type The identifier, useful to localize emitted errors.
     * @param message The error message.
     */
    constructor(options: UserError.Options);
    get name(): string;
}
declare namespace UserError {
    /**
     * The options for [[UserError]].
     * @since 1.0.0
     */
    interface Options {
        /**
         * The identifier for this error.
         * @since 1.0.0
         */
        identifier: string;
        /**
         * The message to be passed to the Error constructor.
         * @since 1.0.0
         */
        message?: string;
        /**
         * The extra context to provide more information about this error.
         * @since 1.0.0
         * @default null
         */
        context?: unknown;
    }
}

/**
 * A type used to express computations that can fail.
 * @typeparam T The result's type.
 * @typeparam E The error's type.
 */
declare type Result<T, E> = Ok<T> | Err<E>;
/**
 * The computation is successful.
 * @typeparam T Type of results.
 */
declare type Ok<T> = Lexure.Ok<T>;
/**
 * The computation failed.
 * @typeparam E Type of errors.
 */
declare type Err<E> = Lexure.Err<E>;
/**
 * Creates an Ok with no value.
 * @return A successful Result.
 */
declare function ok(): Ok<unknown>;
/**
 * Creates an Ok.
 * @typeparam T The result's type.
 * @param x Value to use.
 * @return A successful Result.
 */
declare function ok<T>(x: T): Ok<T>;
/**
 * Creates an Err with no error.
 * @return An erroneous Result.
 */
declare function err(): Err<unknown>;
/**
 * Creates an Err.
 * @typeparam E The error's type.
 * @param x Value to use.
 * @return An erroneous Result.
 */
declare function err<E>(x: E): Err<E>;
/**
 * Determines whether or not a result is an Ok.
 * @typeparam T The result's type.
 * @typeparam E The error's type.
 */
declare function isOk<T, E>(x: Result<T, E>): x is Ok<T>;
/**
 * Determines whether or not a result is an Err.
 * @typeparam T The result's type.
 * @typeparam E The error's type.
 */
declare function isErr<T, E>(x: Result<T, E>): x is Err<E>;

/**
 * Errors thrown by preconditions
 * @property name This will be `'PreconditionError'` and can be used to distinguish the type of error when any error gets thrown
 */
declare class PreconditionError extends UserError {
    readonly precondition: Precondition;
    constructor(options: PreconditionError.Options);
    get name(): string;
}
declare namespace PreconditionError {
    /**
     * The options for [[PreconditionError]].
     * @since 1.0.0
     */
    interface Options extends Omit<UserError.Options, 'identifier'> {
        /**
         * The precondition that caused the error.
         * @since 1.0.0
         */
        precondition: Precondition;
        /**
         * The identifier.
         * @since 1.0.0
         * @default precondition.name
         */
        identifier?: string;
    }
}

declare type PreconditionResult = Awaited<Result<unknown, UserError>>;
declare type AsyncPreconditionResult = Promise<Result<unknown, UserError>>;
interface PreconditionOptions extends PieceOptions {
    /**
     * The position for the precondition to be set at in the global precondition list. If set to `null`, this
     * precondition will not be set as a global one.
     * @default null
     */
    position?: number | null;
}
interface PreconditionContext extends Record<PropertyKey, unknown> {
    external?: boolean;
}
declare abstract class Precondition extends Piece {
    readonly position: number | null;
    constructor(context: PieceContext, options?: Precondition.Options);
    abstract run(message: Message, command: Command, context: Precondition.Context): Precondition.Result;
    ok(): Precondition.Result;
    /**
     * Constructs a [[PreconditionError]] with the precondition parameter set to `this`.
     * @param options The information.
     */
    error(options?: Omit<PreconditionError.Options, 'precondition'>): Precondition.Result;
}
declare namespace Precondition {
    type Options = PreconditionOptions;
    type Context = PreconditionContext;
    type Result = PreconditionResult;
    type AsyncResult = AsyncPreconditionResult;
}

/**
 * Defines the result's value for a PreconditionContainer.
 * @since 1.0.0
 */
declare type PreconditionContainerResult = Result<unknown, UserError>;
/**
 * Defines the return type of the generic [[IPreconditionContainer.run]].
 * @since 1.0.0
 */
declare type PreconditionContainerReturn = Awaited<PreconditionContainerResult>;
/**
 * Async-only version of [[PreconditionContainerReturn]], to be used when the run method is async.
 * @since 1.0.0
 */
declare type AsyncPreconditionContainerReturn = Promise<PreconditionContainerResult>;
/**
 * An abstracted precondition container to be implemented by classes.
 * @since 1.0.0
 */
interface IPreconditionContainer {
    /**
     * Runs a precondition container.
     * @since 1.0.0
     * @param message The message that ran this precondition.
     * @param command The command the message invoked.
     */
    run(message: Message, command: Command, context?: PreconditionContext): PreconditionContainerReturn;
}

/**
 * Defines the condition for [[PreconditionContainerArray]]s to run.
 * @since 1.0.0
 */
interface IPreconditionCondition {
    /**
     * Runs the containers one by one.
     * @seealso [[PreconditionRunMode.sequential]]
     * @since 1.0.0
     * @param message The message that ran this precondition.
     * @param command The command the message invoked.
     * @param entries The containers to run.
     */
    sequential(message: Message, command: Command, entries: readonly IPreconditionContainer[], context: PreconditionContext): PreconditionContainerReturn;
    /**
     * Runs all the containers using `Promise.all`, then checks the results once all tasks finished running.
     * @seealso [[PreconditionRunMode.parallel]]
     * @since 1.0.0
     * @param message The message that ran this precondition.
     * @param command The command the message invoked.
     * @param entries The containers to run.
     */
    parallel(message: Message, command: Command, entries: readonly IPreconditionContainer[], context: PreconditionContext): PreconditionContainerReturn;
}

/**
 * Defines the detailed options for the [[PreconditionContainerSingle]], where both the [[PreconditionContext]] and the
 * name of the precondition can be defined.
 * @since 1.0.0
 */
interface PreconditionSingleResolvableDetails {
    /**
     * The name of the precondition to retrieve from [[SapphireClient.preconditions]].
     * @since 1.0.0
     */
    name: string;
    /**
     * The context to be set at [[PreconditionContainerSingle.context]].
     * @since 1.0.0
     */
    context: Record<PropertyKey, unknown>;
}
/**
 * Defines the data accepted by [[PreconditionContainerSingle]]'s constructor.
 * @since 1.0.0
 */
declare type PreconditionSingleResolvable = string | PreconditionSingleResolvableDetails;
/**
 * An [[IPreconditionContainer]] which runs a single precondition from [[SapphireClient.preconditions]].
 * @since 1.0.0
 */
declare class PreconditionContainerSingle implements IPreconditionContainer {
    /**
     * The context to be used when calling [[Precondition.run]]. This will always be an empty object (`{}`) when the
     * container was constructed with a string, otherwise it is a direct reference to the value from
     * [[PreconditionSingleResolvableDetails.context]].
     * @since 1.0.0
     */
    readonly context: Record<PropertyKey, unknown>;
    /**
     * The name of the precondition to run.
     * @since 1.0.0
     */
    readonly name: string;
    constructor(data: PreconditionSingleResolvable);
    /**
     * Runs the container.
     * @since 1.0.0
     * @param message The message that ran this precondition.
     * @param command The command the message invoked.
     */
    run(message: Message, command: Command, context?: PreconditionContext): PreconditionResult;
}

/**
 * The run mode for a [[PreconditionContainerArray]].
 * @since 1.0.0
 */
declare const enum PreconditionRunMode {
    /**
     * The entries are run sequentially, this is the default behaviour and can be slow when doing long asynchronous
     * tasks, but is performance savvy.
     * @since 1.0.0
     */
    Sequential = 0,
    /**
     * All entries are run in parallel using `Promise.all`, then the results are processed after all of them have
     * completed.
     * @since 1.0.0
     */
    Parallel = 1
}
/**
 * The condition for a [[PreconditionContainerArray]].
 */
declare enum PreconditionRunCondition {
    /**
     * Defines a condition where all the entries must pass. This uses [[PreconditionConditionAnd]].
     * @since 1.0.0
     */
    And = 0,
    /**
     * Defines a condition where at least one entry must pass. This uses [[PreconditionConditionOr]].
     * @since 1.0.0
     */
    Or = 1
}
/**
 * Defines the detailed options for the [[PreconditionContainerArray]], where both the [[PreconditionRunMode]] and the
 * entries can be defined.
 * @since 1.0.0
 */
interface PreconditionArrayResolvableDetails {
    /**
     * The data that will be used to resolve [[IPreconditionContainer]] dependent of this one.
     * @since 1.0.0
     */
    entries: readonly PreconditionEntryResolvable[];
    /**
     * The mode the [[PreconditionContainerArray]] will run.
     * @since 1.0.0
     */
    mode: PreconditionRunMode;
}
/**
 * Defines the data accepted by [[PreconditionContainerArray]]'s constructor.
 * @since 1.0.0
 */
declare type PreconditionArrayResolvable = readonly PreconditionEntryResolvable[] | PreconditionArrayResolvableDetails;
/**
 * Defines the data accepted for each entry of the array.
 * @since 1.0.0
 * @seealso [[PreconditionArrayResolvable]]
 * @seealso [[PreconditionArrayResolvableDetails.entries]]
 */
declare type PreconditionEntryResolvable = PreconditionSingleResolvable | PreconditionArrayResolvable;
/**
 * An [[IPreconditionContainer]] that defines an array of multiple [[IPreconditionContainer]]s.
 *
 * By default, array containers run either of two conditions: AND and OR ([[PreconditionRunCondition]]), the top level
 * will always default to AND, where the nested one flips the logic (OR, then children arrays are AND, then OR...).
 *
 * This allows `['Connect', ['Moderator', ['DJ', 'SongAuthor']]]` to become a thrice-nested precondition container, where:
 * - Level 1: [Single(Connect), Array] runs AND, both containers must return a successful value.
 * - Level 2: [Single(Moderator), Array] runs OR, either container must return a successful value.
 * - Level 3: [Single(DJ), Single(SongAuthor)] runs AND, both containers must return a successful value.
 *
 * In other words, it is identical to doing:
 * ```typescript
 * Connect && (Moderator || (DJ && SongAuthor));
 * ```
 * @remark More advanced logic can be accomplished by adding more [[IPreconditionCondition]]s (e.g. other operators),
 * see [[PreconditionContainerArray.conditions]] for more information.
 * @since 1.0.0
 */
declare class PreconditionContainerArray implements IPreconditionContainer {
    /**
     * The mode at which this precondition will run.
     * @since 1.0.0
     */
    readonly mode: PreconditionRunMode;
    /**
     * The [[IPreconditionContainer]]s the array holds.
     * @since 1.0.0
     */
    readonly entries: IPreconditionContainer[];
    /**
     * The [[PreconditionRunCondition]] that defines how entries must be handled.
     * @since 1.0.0
     */
    readonly runCondition: PreconditionRunCondition;
    constructor(data?: PreconditionArrayResolvable, parent?: PreconditionContainerArray | null);
    /**
     * Adds a new entry to the array.
     * @since 1.0.0
     * @param entry The value to add to the entries.
     */
    add(entry: IPreconditionContainer): this;
    /**
     * Runs the container.
     * @since 1.0.0
     * @param message The message that ran this precondition.
     * @param command The command the message invoked.
     */
    run(message: Message, command: Command, context?: PreconditionContext): PreconditionContainerReturn;
    /**
     * Parses the precondition entry resolvables, and adds them to the entries.
     * @since 1.0.0
     * @param entries The entries to parse.
     */
    protected parse(entries: Iterable<PreconditionEntryResolvable>): this;
    /**
     * Retrieves a condition from [[PreconditionContainerArray.conditions]], assuming existence.
     * @since 1.0.0
     */
    protected get condition(): IPreconditionCondition;
    /**
     * The preconditions to be run. Extra ones can be added by augmenting [[PreconditionRunCondition]] and then
     * inserting [[IPreconditionCondition]]s.
     * @since 1.0.0
     * @example
     * ```typescript
     * // Adding more kinds of conditions
     *
     * // Set the new condition:
     * PreconditionContainerArray.conditions.set(2, PreconditionConditionRandom);
     *
     * // Augment Sapphire to add the new condition, in case of a JavaScript
     * // project, this can be moved to an `Augments.d.ts` (or any other name)
     * // file somewhere:
     * declare module '(at)sapphire/framework' {
     *   export enum PreconditionRunCondition {
     *     Random = 2
     *   }
     * }
     * ```
     */
    static readonly conditions: Collection<PreconditionRunCondition, IPreconditionCondition>;
}

/**
 * The strategy options used in Sapphire.
 */
interface FlagStrategyOptions {
    /**
     * The accepted flags. Flags are key-only identifiers that can be placed anywhere in the command.
     * @default []
     */
    flags?: readonly string[];
    /**
     * The accepted options. Options are key-value identifiers that can be placed anywhere in the command.
     * @default []
     */
    options?: readonly string[];
    /**
     * The prefixes for both flags and options.
     * @default ['--', '-', '—']
     */
    prefixes?: string[];
    /**
     * The flag separators.
     * @default ['=', ':']
     */
    separators?: string[];
}

declare abstract class Command<T = Args> extends AliasPiece {
    /**
     * A basic summary about the command
     * @since 1.0.0
     */
    description: string;
    /**
     * The preconditions to be run.
     * @since 1.0.0
     */
    preconditions: IPreconditionContainer;
    /**
     * Longer version of command's summary and how to use it
     * @since 1.0.0
     */
    detailedDescription: string;
    /**
     * The strategy to use for the lexer.
     * @since 1.0.0
     */
    strategy: Lexure.UnorderedStrategy;
    /**
     * The lexer to be used for command parsing
     * @since 1.0.0
     * @private
     */
    protected lexer: Lexure.Lexer;
    /**
     * @since 1.0.0
     * @param context The context.
     * @param options Optional Command settings.
     */
    protected constructor(context: PieceContext, { name, ...options }?: CommandOptions);
    /**
     * The pre-parse method. This method can be overridden by plugins to define their own argument parser.
     * @param message The message that triggered the command.
     * @param parameters The raw parameters as a single string.
     * @param context The command-context used in this execution.
     */
    preParse(message: Message, parameters: string, context: CommandContext): Awaited<T>;
    /**
     * Executes the command's logic.
     * @param message The message that triggered the command.
     * @param args The value returned by [[Command.preParse]], by default an instance of [[Args]].
     */
    abstract run(message: Message, args: T, context: CommandContext): Awaited<unknown>;
    /**
     * Defines the JSON.stringify behavior of the command.
     */
    toJSON(): Record<string, any>;
    protected resolveConstructorPreConditions(options: CommandOptions): readonly PreconditionEntryResolvable[];
    private resolveConstructorPreConditionsRunType;
}
/**
 * The allowed values for [[CommandOptions.runIn]].
 * @since 2.0.0
 */
declare type CommandOptionsRunType = 'dm' | 'text' | 'news' | 'guild';
/**
 * The available command pre-conditions.
 * @since 2.0.0
 */
declare const enum CommandPreConditions {
    Cooldown = "Cooldown",
    NotSafeForWork = "NSFW",
    DirectMessageOnly = "DMOnly",
    TextOnly = "TextOnly",
    NewsOnly = "NewsOnly",
    GuildOnly = "GuildOnly"
}
/**
 * The [[Command]] options.
 * @since 1.0.0
 */
interface CommandOptions extends AliasPieceOptions {
    /**
     * Whether to add aliases for commands with dashes in them
     * @since 1.0.0
     * @default false
     */
    generateDashLessAliases?: boolean;
    /**
     * The description for the command.
     * @since 1.0.0
     * @default ''
     */
    description?: string;
    /**
     * The detailed description for the command.
     * @since 1.0.0
     * @default ''
     */
    detailedDescription?: string;
    /**
     * The [[Precondition]]s to be run, accepts an array of their names.
     * @seealso [[PreconditionContainerArray]]
     * @since 1.0.0
     * @default []
     */
    preconditions?: readonly PreconditionEntryResolvable[];
    /**
     * The options for the lexer strategy.
     * @since 1.0.0
     * @default {}
     */
    strategyOptions?: FlagStrategyOptions;
    /**
     * The quotes accepted by this command, pass `[]` to disable them.
     * @since 1.0.0
     * @default
     * [
     *   ['"', '"'], // Double quotes
     *   ['“', '”'], // Fancy quotes (on iOS)
     *   ['「', '」'] // Corner brackets (CJK)
     * ]
     */
    quotes?: [string, string][];
    /**
     * Sets whether or not the command should be treated as NSFW. If set to true, the `NSFW` precondition will be added to the list.
     * @since 2.0.0
     * @default false
     */
    nsfw?: boolean;
    /**
     * Sets the bucket of the cool-down, if set to a non-zero value alongside {@link CommandOptions.cooldownDuration}, the `Cooldown` precondition will be added to the list.
     * @since 2.0.0
     * @default 1
     */
    cooldownBucket?: number;
    /**
     * Sets the duration of the tickets in the cool-down, if set to a non-zero value alongside {@link CommandOptions.cooldownBucket}, the `Cooldown` precondition will be added to the list.
     * @since 2.0.0
     * @default 0
     */
    cooldownDuration?: number;
    /**
     * The channels the command should run in. If set to `null`, no precondition entry will be added. Some optimizations are applied when given an array to reduce the amount of preconditions run (e.g. `'text'` and `'news'` becomes `'guild'`, and if both `'dm'` and `'guild'` are defined, then no precondition entry is added as it runs in all channels).
     * @since 2.0.0
     * @default null
     */
    runIn?: CommandOptionsRunType | readonly CommandOptionsRunType[] | null;
}
interface CommandContext extends Record<PropertyKey, unknown> {
    /**
     * The prefix used to run this command.
     *
     * This is a string for the mention and default prefix, and a RegExp for the `regexPrefix`.
     */
    prefix: string | RegExp;
    /**
     * The alias used to run this command.
     */
    commandName: string;
    /**
     * The matched prefix, this will always be the same as [[CommandContext.prefix]] if it was a string, otherwise it is
     * the result of doing `prefix.exec(content)[0]`.
     */
    commandPrefix: string;
}

/**
 * A type used to express a value that may or may not exist.
 * @typeparam T The value's type.
 */
declare type Maybe<T> = Some<T> | None;
/**
 * A value that exists.
 * @typeparam T The value's type.
 */
declare type Some<T> = option.Some<T>;
/**
 * An empty value.
 */
declare type None = option.None;
/**
 * Returns the maybe itself.
 * @param value The value to convert.
 */
declare function maybe<T, V extends Maybe<T>>(value: V): V;
/**
 * Creates a [[None]] from an existing [[None]] or a `null`.
 * @param value The value to convert.
 */
declare function maybe(value: null | None): None;
/**
 * Creates a [[Some]] from a non-null value or an existing [[Some]], or a [[None]] otherwise.
 * @param value The value to convert.
 */
declare function maybe<T>(value: T | Maybe<T> | null): Maybe<T>;
/**
 * Creates a [[Some]] from a non-null value or an existing [[Some]].
 * @param value The value to convert.
 */
declare function maybe<T>(value: T | Some<T>): Some<T>;
/**
 * Creates a None with no value.
 * @return An existing Maybe.
 */
declare function some(): Some<unknown>;
/**
 * Creates a None with a value.
 * @typeparam T The value's type.
 * @param x Value to use.
 * @return An existing Maybe.
 */
declare function some<T>(x: T): Some<T>;
/**
 * Creates a None value.
 * @return A non-existing Maybe.
 */
declare function none(): None;
/**
 * Determines whether or not a Maybe is a Some.
 * @typeparam T The value's type.
 */
declare function isSome<T>(x: Maybe<T>): x is Some<T>;
/**
 * Determines whether or not a Maybe is a None.
 * @typeparam T The value's type.
 */
declare function isNone<T>(x: Maybe<T>): x is None;
/**
 * Type-safe helper to preserve the type parameter's type.
 * @param x The value to check.
 */
declare function isMaybe<T>(x: Maybe<T>): true;
/**
 * Determines whether or not an arbitrary value is a Maybe.
 * @param x The value to check.
 */
declare function isMaybe<T>(x: unknown): x is Maybe<T>;

/**
 * The argument parser to be used in [[Command]].
 */
declare class Args {
    /**
     * The original message that triggered the command.
     */
    readonly message: Message;
    /**
     * The command that is being run.
     */
    readonly command: Command;
    /**
     * The context of the command being run.
     */
    readonly commandContext: CommandContext;
    /**
     * The internal Lexure parser.
     */
    protected readonly parser: Lexure.Args;
    /**
     * The states stored in the args.
     * @see Args#save
     * @see Args#restore
     */
    private readonly states;
    constructor(message: Message, command: Command, parser: Lexure.Args, context: CommandContext);
    /**
     * Sets the parser to the first token.
     */
    start(): Args;
    /**
     * Retrieves the next parameter and parses it. Advances index on success.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !square 5
     * const resolver = Args.make((arg) => {
     *   const parsed = Number(argument);
     *   if (Number.isNaN(parsed)) return err(new UserError('ArgumentNumberNaN', 'You must write a valid number.'));
     *   return ok(parsed);
     * });
     * const a = await args.pickResult(resolver);
     * if (!a.success) throw new UserError('ArgumentNumberNaN', 'You must write a valid number.');
     *
     * await message.channel.send(`The result is: ${a.value ** 2}!`);
     * // Sends "The result is: 25"
     * ```
     */
    pickResult<T>(type: IArgument<T>, options?: ArgOptions): Promise<Result<T, UserError>>;
    /**
     * Retrieves the next parameter and parses it. Advances index on success.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !add 1 2
     * const a = await args.pickResult('integer');
     * if (!a.success) throw new UserError('AddArgumentError', 'You must write two numbers, but the first one did not match.');
     *
     * const b = await args.pickResult('integer');
     * if (!b.success) throw new UserError('AddArgumentError', 'You must write two numbers, but the second one did not match.');
     *
     * await message.channel.send(`The result is: ${a.value + b.value}!`);
     * // Sends "The result is: 3"
     * ```
     */
    pickResult<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<Result<ArgType[K], UserError>>;
    /**
     * Similar to [[Args.pickResult]] but returns the value on success, throwing otherwise.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !square 5
     * const resolver = Args.make((arg) => {
     *   const parsed = Number(argument);
     *   if (Number.isNaN(parsed)) return err(new UserError('ArgumentNumberNaN', 'You must write a valid number.'));
     *   return ok(parsed);
     * });
     * const a = await args.pick(resolver);
     *
     * await message.channel.send(`The result is: ${a ** 2}!`);
     * // Sends "The result is: 25"
     * ```
     */
    pick<T>(type: IArgument<T>, options?: ArgOptions): Promise<T>;
    /**
     * Similar to [[Args.pickResult]] but returns the value on success, throwing otherwise.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !add 1 2
     * const a = await args.pick('integer');
     * const b = await args.pick('integer');
     * await message.channel.send(`The result is: ${a + b}!`);
     * // Sends "The result is: 3"
     * ```
     */
    pick<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<ArgType[K]>;
    /**
     * Retrieves all the following arguments.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !reverse Hello world!
     * const resolver = Args.make((arg) => ok(arg.split('').reverse()));
     * const a = await args.restResult(resolver);
     * if (!a.success) throw new UserError('AddArgumentError', 'You must write some text.');
     *
     * await message.channel.send(`The reversed value is... ${a.value}`);
     * // Sends "The reversed value is... !dlrow olleH"
     * ```
     */
    restResult<T>(type: IArgument<T>, options?: ArgOptions): Promise<Result<T, UserError>>;
    /**
     * Retrieves all the following arguments.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !add 2 Hello World!
     * const a = await args.pickResult('integer');
     * if (!a.success) throw new UserError('AddArgumentError', 'You must write a number and a text, but the former did not match.');
     *
     * const b = await args.restResult('string', { minimum: 1 });
     * if (!b.success) throw new UserError('AddArgumentError', 'You must write a number and a text, but the latter did not match.');
     *
     * await message.channel.send(`The repeated value is... ${b.value.repeat(a.value)}!`);
     * // Sends "The repeated value is... Hello World!Hello World!"
     * ```
     */
    restResult<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<Result<ArgType[K], UserError>>;
    /**
     * Similar to [[Args.restResult]] but returns the value on success, throwing otherwise.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !reverse Hello world!
     * const resolver = Args.make((arg) => ok(arg.split('').reverse()));
     * const a = await args.rest(resolver);
     * await message.channel.send(`The reversed value is... ${a}`);
     * // Sends "The reversed value is... !dlrow olleH"
     * ```
     */
    rest<T>(type: IArgument<T>, options?: ArgOptions): Promise<T>;
    /**
     * Similar to [[Args.restResult]] but returns the value on success, throwing otherwise.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !add 2 Hello World!
     * const a = await args.pick('integer');
     * const b = await args.rest('string', { minimum: 1 });
     * await message.channel.send(`The repeated value is... ${b.repeat(a)}!`);
     * // Sends "The repeated value is... Hello World!Hello World!"
     * ```
     */
    rest<K extends keyof ArgType>(type: K, options?: ArgOptions): Promise<ArgType[K]>;
    /**
     * Retrieves all the following arguments.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !add 2 Hello World!
     * const resolver = Args.make((arg) => ok(arg.split('').reverse()));
     * const result = await args.repeatResult(resolver, { times: 5 });
     * if (!result.success) throw new UserError('CountArgumentError', 'You must write up to 5 words.');
     *
     * await message.channel.send(`You have written ${result.value.length} word(s): ${result.value.join(' ')}`);
     * // Sends "You have written 2 word(s): olleH !dlroW"
     * ```
     */
    repeatResult<T>(type: IArgument<T>, options?: RepeatArgOptions): Promise<Result<T[], UserError>>;
    /**
     * Retrieves all the following arguments.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !reverse-each 2 Hello World!
     * const result = await args.repeatResult('string', { times: 5 });
     * if (!result.success) throw new UserError('CountArgumentError', 'You must write up to 5 words.');
     *
     * await message.channel.send(`You have written ${result.value.length} word(s): ${result.value.join(' ')}`);
     * // Sends "You have written 2 word(s): Hello World!"
     * ```
     */
    repeatResult<K extends keyof ArgType>(type: K, options?: RepeatArgOptions): Promise<Result<ArgType[K][], UserError>>;
    /**
     * Similar to [[Args.repeatResult]] but returns the value on success, throwing otherwise.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !reverse-each 2 Hello World!
     * const resolver = Args.make((arg) => ok(arg.split('').reverse()));
     * const result = await args.repeat(resolver, { times: 5 });
     * await message.channel.send(`You have written ${result.length} word(s): ${result.join(' ')}`);
     * // Sends "You have written 2 word(s): Hello World!"
     * ```
     */
    repeat<T>(type: IArgument<T>, options?: RepeatArgOptions): Promise<T[]>;
    /**
     * Similar to [[Args.repeatResult]] but returns the value on success, throwing otherwise.
     * @param type The type of the argument.
     * @example
     * ```typescript
     * // !add 2 Hello World!
     * const words = await args.repeat('string', { times: 5 });
     * await message.channel.send(`You have written ${words.length} word(s): ${words.join(' ')}`);
     * // Sends "You have written 2 word(s): Hello World!"
     * ```
     */
    repeat<K extends keyof ArgType>(type: K, options?: RepeatArgOptions): Promise<ArgType[K][]>;
    /**
     * Peeks the following parameter(s) without advancing the parser's state.
     * Passing a function as a parameter allows for returning [[Args.pickResult]], [[Args.repeatResult]],
     * or [[Args.restResult]]; otherwise, passing the custom argument or the argument type with options
     * will use [[Args.pickResult]] and only peek a single argument.
     * @param type The function, custom argument, or argument name.
     * @example
     * ```typescript
     * // !reversedandscreamfirst hello world
     * const resolver = Args.make((arg) => ok(arg.split('').reverse().join('')));
     *
     * const result = await args.peekResult(() => args.repeatResult(resolver));
     * if (isOk(result)) await message.channel.send(
     *   `Reversed ${result.value.length} word(s): ${result.value.join(' ')}`
     * ); // Reversed 2 word(s): olleh dlrow
     *
     * const firstWord = await args.pickResult('string');
     * if (isOk(firstWord)) await message.channel.send(firstWord.value.toUpperCase()); // HELLO
     * ```
     */
    peekResult<T>(type: () => ArgumentResult<T>): Promise<Result<T, UserError>>;
    /**
     * Peeks the following parameter(s) without advancing the parser's state.
     * Passing a function as a parameter allows for returning [[Args.pickResult]], [[Args.repeatResult]],
     * or [[Args.restResult]]; otherwise, passing the custom argument or the argument type with options
     * will use [[Args.pickResult]] and only peek a single argument.
     * @param type The function, custom argument, or argument name.
     * @wxample
     * ```typescript
     * // !reverseandscreamfirst sapphire community
     * const resolver = Args.make((arg) => ok(arg.split('').reverse().join('')));
     *
     * const peekedWord = await args.peekResult(resolver);
     * if (isOk(peekedWord)) await message.channel.send(peekedWord.value); // erihppas
     *
     * const firstWord = await args.pickResult('string');
     * if (isOk(firstWord)) await message.channel.send(firstWord.value.toUpperCase()); // SAPPHIRE
     * ```
     */
    peekResult<T>(type: IArgument<T>, options?: ArgOptions): Promise<Result<T, UserError>>;
    /**
     * Peeks the following parameter(s) without advancing the parser's state.
     * Passing a function as a parameter allows for returning [[Args.pickResult]], [[Args.repeatResult]],
     * or [[Args.restResult]]; otherwise, passing the custom argument or the argument type with options
     * will use [[Args.pickResult]] and only peek a single argument.
     * @param type The function, custom argument, or argument name.
     * @example
     * ```typescript
     * // !datethenaddtwo 1608867472611
     * const date = await args.peekResult('date');
     * if (isOk(date)) await message.channel.send(
     *   `Your date (in UTC): ${date.value.toUTCString()}`
     * ); // Your date (in UTC): Fri, 25 Dec 2020 03:37:52 GMT
     *
     * const result = await args.pickResult('number', { maximum: Number.MAX_SAFE_INTEGER - 2 });
     * if (isOk(result)) await message.channel.send(`Your number plus two: ${result.value + 2}`); // Your number plus two: 1608867472613
     * ```
     */
    peekResult<K extends keyof ArgType>(type: (() => ArgumentResult<ArgType[K]>) | K, options?: ArgOptions): Promise<Result<ArgType[K], UserError>>;
    /**
     * Similar to [[Args.peekResult]] but returns the value on success, throwing otherwise.
     * @param type The function, custom argument, or argument name.
     * @example
     * ```typescript
     * // !bigintsumthensquarefirst 25 50 75
     * const resolver = Args.make((arg) => {
     *   try {
     *     return ok(BigInt(arg));
     *   } catch {
     *     return err(new UserError('InvalidBigInt', 'You must specify a valid number for a bigint.'));
     *   }
     * });
     *
     * const peeked = await args.peek(() => args.repeatResult(resolver));
     * await message.channel.send(`Sum: **${peeked.reduce((x, y) => x + y, 0)}**`); // Sum: 150
     *
     * const first = await args.pick(resolver);
     * await message.channel.send(`First bigint squared: ${first**2n}`); // First bigint squared: 625
     * ```
     */
    peek<T>(type: () => ArgumentResult<T>): Promise<T>;
    /**
     * Similar to [[Args.peekResult]] but returns the value on success, throwing otherwise.
     * @param type The function, custom argument, or argument name.
     * @example
     * ```typescript
     * // !createdat 730159185517477900
     * const snowflakeResolver = Args.make((arg) =>
     * 	 SnowflakeRegex.test(arg) ? ok(BigInt(arg)) : err(new UserError('InvalidSnowflake', 'You must specify a valid snowflake.'));
     * );
     *
     * const snowflake = await args.peek(snowflakeResolver);
     * const timestamp = Number((snowflake >> 22n) + DiscordSnowflake.Epoch);
     * const createdAt = new Date(timestamp);
     *
     * await message.channel.send(
     *   `The snowflake ${snowflake} was registered on ${createdAt.toUTCString()}.`
     * ); // The snowflake 730159185517477900 was registered on Tue, 07 Jul 2020 20:31:55 GMT.
     *
     * const id = await args.pick('string');
     * await message.channel.send(`Your ID, reversed: ${id.split('').reverse().join('')}`); // Your ID, reversed: 009774715581951037
     * ```
     */
    peek<T>(type: IArgument<T>, options?: ArgOptions): Promise<T>;
    /**
     * Similar to [[Args.peekResult]] but returns the value on success, throwing otherwise.
     * @param type The function, custom argument, or argument name.
     * @example
     * ```typescript
     * // !messagelink https://discord.com/channels/737141877803057244/737142209639350343/791843123898089483
     * const remoteMessage = await args.peek('message');
     * await message.channel.send(
     *   `${remoteMessage.author.tag}: ${remoteMessage.content}`
     * ); // RealShadowNova#7462: Yeah, Sapphire has been a great experience so far, especially being able to help and contribute.
     *
     * const url = await args.pick('hyperlink');
     * await message.channel.send(`Hostname: ${url.hostname}`); // Hostname: discord.com
     * ```
     */
    peek<K extends keyof ArgType>(type: (() => ArgumentResult<ArgType[K]>) | K, options?: ArgOptions): Promise<ArgType[K]>;
    /**
     * Retrieves the next raw argument from the parser.
     * @example
     * ```typescript
     * // !numbers 1 2 3
     *
     * console.log(args.nextMaybe());
     * // -> { exists: true, value: '1' }
     * ```
     */
    nextMaybe(): Maybe<string>;
    /**
     * Retrieves the value of the next unused ordered token, but only if it could be transformed.
     * That token will now be consider used if the transformation succeeds.
     * @typeparam T Output type of the [[ArgsNextCallback callback]].
     * @param cb Gives an option of either the resulting value, or nothing if failed.
     * @example
     * ```typescript
     * // !numbers 1 2 3
     * const parse = (x: string) => {
     *   const n = Number(x);
     *   return Number.isNaN(n) ? none() : some(n);
     * };
     *
     * console.log(args.nextMaybe(parse));
     * // -> { exists: true, value: 1 }
     * ```
     */
    nextMaybe<T>(cb: ArgsNextCallback<T>): Maybe<T>;
    /**
     * Similar to [[Args.nextMaybe]] but returns the value on success, null otherwise.
     * @example
     * ```typescript
     * // !numbers 1 2 3
     *
     * console.log(args.next());
     * // -> '1'
     * ```
     */
    next(): string;
    /**
     * Similar to [[Args.nextMaybe]] but returns the value on success, null otherwise.
     * @typeparam T Output type of the [[ArgsNextCallback callback]].
     * @param cb Gives an option of either the resulting value, or nothing if failed.
     * @example
     * ```typescript
     * // !numbers 1 2 3
     * const parse = (x: string) => {
     *   const n = Number(x);
     *   return Number.isNaN(n) ? none() : some(n);
     * };
     *
     * console.log(args.nextMaybe(parse));
     * // -> 1
     * ```
     */
    next<T>(cb: ArgsNextCallback<T>): T;
    /**
     * Checks if one or more flag were given.
     * @param keys The name(s) of the flag.
     * @example
     * ```typescript
     * // Suppose args are from '--f --g'.
     * console.log(args.getFlags('f'));
     * >>> true
     *
     * console.log(args.getFlags('g', 'h'));
     * >>> true
     *
     * console.log(args.getFlags('h'));
     * >>> false
     * ```
     */
    getFlags(...keys: readonly string[]): boolean;
    /**
     * Gets the last value of one or more options.
     * @param keys The name(s) of the option.
     * @example
     * ```typescript
     * // Suppose args are from '--a=1 --b=2 --c=3'.
     * console.log(args.getOption('a'));
     * >>> '1'
     *
     * console.log(args.getOption('b', 'c'));
     * >>> '2'
     *
     * console.log(args.getOption('d'));
     * >>> null
     * ```
     */
    getOption(...keys: readonly string[]): string | null;
    /**
     * Gets all the values of one or more option.
     * @param keys The name(s) of the option.
     * @example
     * ```typescript
     * // Suppose args are from '--a=1 --a=1 --b=2 --c=3'.
     * console.log(args.getOptions('a'));
     * >>> ['1', '1']
     *
     * console.log(args.getOptions('b', 'c'));
     * >>> ['2', '3']
     *
     * console.log(args.getOptions('d'));
     * >>> null
     * ```
     */
    getOptions(...keys: readonly string[]): string[] | null;
    /**
     * Saves the current state into the stack following a FILO strategy (first-in, last-out).
     * @see Args#restore
     */
    save(): void;
    /**
     * Restores the previously saved state from the stack.
     * @see Args#save
     */
    restore(): void;
    /**
     * Whether all arguments have been consumed.
     */
    get finished(): boolean;
    /**
     * Defines the `JSON.stringify` override.
     */
    toJSON(): {
        message: Message;
        command: Command<Args>;
        commandContext: CommandContext;
    };
    protected unavailableArgument<T>(type: string | IArgument<T>): Err<UserError>;
    protected missingArguments(): Err<UserError>;
    /**
     * Resolves an argument.
     * @param arg The argument name or [[IArgument]] instance.
     */
    private resolveArgument;
    /**
     * Converts a callback into an usable argument.
     * @param cb The callback to convert into an [[IArgument]].
     */
    static make<T>(cb: IArgument<T>['run'], name?: string): IArgument<T>;
    /**
     * Constructs an [[Ok]] result.
     * @param value The value to pass.
     */
    static ok<T>(value: T): Ok<T>;
    /**
     * Constructs an [[Err]] result containing an [[ArgumentError]].
     * @param options The options for the argument error.
     */
    static error<T>(options: ArgumentError.Options<T>): Err<ArgumentError<T>>;
}
interface ArgType {
    boolean: boolean;
    categoryChannel: CategoryChannel;
    channel: Channel;
    date: Date;
    dmChannel: DMChannel;
    float: number;
    guildChannel: GuildChannel;
    hyperlink: URL;
    integer: number;
    member: GuildMember;
    message: Message;
    newsChannel: NewsChannel;
    number: number;
    role: Role;
    string: string;
    textChannel: TextChannel;
    url: URL;
    user: User;
    voiceChannel: VoiceChannel;
}
interface ArgOptions extends Omit<ArgumentContext, 'message' | 'command'> {
}
interface RepeatArgOptions extends ArgOptions {
    /**
     * The maximum amount of times the argument can be repeated.
     * @default Infinity
     */
    times?: number;
}
/**
 * The callback used for [[Args.nextMaybe]] and [[Args.next]].
 */
interface ArgsNextCallback<T> {
    /**
     * The value to be mapped.
     */
    (value: string): Maybe<T>;
}

/**
 * Defines a synchronous result of an [[Argument]], check [[AsyncArgumentResult]] for the asynchronous version.
 */
declare type ArgumentResult<T> = Awaited<Result<T, UserError>>;
/**
 * Defines an asynchronous result of an [[Argument]], check [[ArgumentResult]] for the synchronous version.
 */
declare type AsyncArgumentResult<T> = Promise<Result<T, UserError>>;
interface IArgument<T> {
    /**
     * The name of the argument, this is used to make the identification of an argument easier.
     */
    readonly name: string;
    /**
     * The method which is called when invoking the argument.
     * @param parameter The string parameter to parse.
     * @param context The context for the method call, contains the message, command, and other options.
     */
    run(parameter: string, context: ArgumentContext<T>): ArgumentResult<T>;
}
/**
 * The base argument class. This class is abstract and is to be extended by subclasses implementing the methods. In
 * Sapphire's workflow, arguments are called when using [[Args]]'s methods (usually used inside [[Command]]s by default).
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { Argument, ArgumentResult, PieceContext } from '(at)sapphire/framework';
 * import { URL } from 'url';
 *
 * // Define a class extending `Argument`, then export it.
 * // NOTE: You can use `export default` or `export =` too.
 * export class CoreArgument extends Argument<URL> {
 *   public constructor(context: PieceContext) {
 *     super(context, { name: 'hyperlink', aliases: ['url'] });
 *   }
 *
 *   public run(argument: string): ArgumentResult<URL> {
 *     try {
 *       return this.ok(new URL(argument));
 *     } catch {
 *       return this.error(argument, 'ArgumentHyperlinkInvalidURL', 'The argument did not resolve to a valid URL.');
 *     }
 *   }
 * }
 *
 * // Augment the ArgType structure so `args.pick('url')`, `args.repeat('url')`
 * // and others have a return type of `URL`.
 * declare module 'sapphire/framework/dist/lib/utils/Args' {
 *   export interface ArgType {
 *     url: URL;
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { Argument } = require('(at)sapphire/framework');
 *
 * // Define a class extending `Argument`, then export it.
 * module.exports = class CoreArgument extends Argument {
 *   constructor(context) {
 *     super(context, { name: 'hyperlink', aliases: ['url'] });
 *   }
 *
 *   run(argument) {
 *     try {
 *       return this.ok(new URL(argument));
 *     } catch {
 *       return this.error(argument, 'ArgumentHyperlinkInvalidURL', 'The argument did not resolve to a valid URL.');
 *     }
 *   }
 * }
 * ```
 */
declare abstract class Argument<T = unknown> extends AliasPiece implements IArgument<T> {
    abstract run(parameter: string, context: ArgumentContext<T>): ArgumentResult<T>;
    /**
     * Wraps a value into a successful value.
     * @param value The value to wrap.
     */
    ok(value: T): ArgumentResult<T>;
    /**
     * Constructs an [[ArgumentError]] with a custom type.
     * @param parameter The parameter that triggered the argument.
     * @param type The identifier for the error.
     * @param message The description message for the rejection.
     */
    error(options: Omit<ArgumentError.Options<T>, 'argument'>): ArgumentResult<T>;
}
interface ArgumentOptions extends AliasPieceOptions {
}
interface ArgumentContext<T = unknown> extends Record<PropertyKey, unknown> {
    argument: IArgument<T>;
    args: Args;
    message: Message;
    command: Command;
    commandContext: CommandContext;
    minimum?: number;
    maximum?: number;
    inclusive?: boolean;
}

/**
 * Errors thrown by the argument parser
 * @since 1.0.0
 * @property name This will be `'ArgumentError'` and can be used to distinguish the type of error when any error gets thrown
 */
declare class ArgumentError<T = unknown> extends UserError {
    readonly argument: IArgument<T>;
    readonly parameter: string;
    constructor(options: ArgumentError.Options<T>);
    get name(): string;
}
declare namespace ArgumentError {
    /**
     * The options for [[ArgumentError]].
     * @since 1.0.0
     */
    interface Options<T> extends Omit<UserError.Options, 'identifier'> {
        /**
         * The argument that caused the error.
         * @since 1.0.0
         */
        argument: IArgument<T>;
        /**
         * The parameter that failed to be parsed.
         * @since 1.0.0
         */
        parameter: string;
        /**
         * The identifier.
         * @since 1.0.0
         * @default argument.name
         */
        identifier?: string;
    }
}

declare const enum Identifiers {
    ArgumentBoolean = "boolean",
    ArgumentCategoryChannel = "categoryChannel",
    ArgumentChannel = "channel",
    ArgumentDate = "date",
    ArgumentDateTooSmall = "dateTooSmall",
    ArgumentDateTooBig = "dateTooBig",
    ArgumentDMChannel = "dmChannel",
    ArgumentFloat = "float",
    ArgumentFloatTooSmall = "floatTooSmall",
    ArgumentFloatTooBig = "floatTooBig",
    ArgumentGuildChannel = "guildChannel",
    ArgumentGuildChannelMissingGuild = "guildChannelMissingGuild",
    ArgumentHyperlink = "hyperlink",
    ArgumentInteger = "integer",
    ArgumentIntegerTooSmall = "integerTooSmall",
    ArgumentIntegerTooBig = "integerTooBig",
    ArgumentMember = "member",
    ArgumentMemberMissingGuild = "memberMissingGuild",
    ArgumentMessage = "message",
    ArgumentNewsChannel = "newsChannel",
    ArgumentNumber = "number",
    ArgumentNumberTooSmall = "numberTooSmall",
    ArgumentNumberTooBig = "numberTooBig",
    ArgumentRole = "role",
    ArgumentRoleMissingGuild = "roleMissingGuild",
    ArgumentStringTooShort = "stringTooShort",
    ArgumentStringTooLong = "stringTooLong",
    ArgumentTextChannel = "textChannel",
    ArgumentUser = "user",
    ArgumentVoiceChannel = "voiceChannel",
    ArgsUnavailable = "argsUnavailable",
    ArgsMissing = "argsMissing",
    CommandDisabled = "commandDisabled",
    PreconditionCooldown = "preconditionCooldown",
    PreconditionDMOnly = "preconditionDmOnly",
    PreconditionGuildOnly = "preconditionGuildOnly",
    PreconditionNewsOnly = "preconditionNewsOnly",
    PreconditionNSFW = "preconditionNsfw",
    PreconditionPermissions = "preconditionPermissions",
    PreconditionTextOnly = "preconditionTextOnly"
}

declare const enum CooldownLevel {
    Author = "author",
    Channel = "channel",
    Guild = "guild"
}
declare const enum PluginHook {
    PreGenericsInitialization = "preGenericsInitialization",
    PreInitialization = "preInitialization",
    PostInitialization = "postInitialization",
    PreLogin = "preLogin",
    PostLogin = "postLogin"
}
/**
 * The level the cooldown applies to
 */
declare const enum BucketType {
    /**
     * Per channel cooldowns
     */
    Channel = 0,
    /**
     * Global cooldowns
     */
    Global = 1,
    /**
     * Per guild cooldowns
     */
    Guild = 2,
    /**
     * Per user cooldowns
     */
    User = 3
}

declare type AsyncPluginHooks = PluginHook.PreLogin | PluginHook.PostLogin;
interface SapphirePluginAsyncHook {
    (this: SapphireClient, options: ClientOptions): Awaited<unknown>;
}
declare type SyncPluginHooks = Exclude<PluginHook, AsyncPluginHooks>;
interface SapphirePluginHook {
    (this: SapphireClient, options: ClientOptions): unknown;
}
interface SapphirePluginHookEntry<T = SapphirePluginHook | SapphirePluginAsyncHook> {
    hook: T;
    type: PluginHook;
    name?: string;
}
declare class PluginManager {
    readonly registry: Set<SapphirePluginHookEntry<SapphirePluginAsyncHook | SapphirePluginHook>>;
    registerHook(hook: SapphirePluginHook, type: SyncPluginHooks, name?: string): this;
    registerHook(hook: SapphirePluginAsyncHook, type: AsyncPluginHooks, name?: string): this;
    registerPreGenericsInitializationHook(hook: SapphirePluginHook, name?: string): this;
    registerPreInitializationHook(hook: SapphirePluginHook, name?: string): this;
    registerPostInitializationHook(hook: SapphirePluginHook, name?: string): this;
    registerPreLoginHook(hook: SapphirePluginAsyncHook, name?: string): this;
    registerPostLoginHook(hook: SapphirePluginAsyncHook, name?: string): this;
    use(plugin: typeof Plugin): this;
    values(): Generator<SapphirePluginHookEntry, void, unknown>;
    values(hook: SyncPluginHooks): Generator<SapphirePluginHookEntry<SapphirePluginHook>, void, unknown>;
    values(hook: AsyncPluginHooks): Generator<SapphirePluginHookEntry<SapphirePluginAsyncHook>, void, unknown>;
}

declare class ArgumentStore extends AliasStore<Argument> {
    constructor();
}

/**
 * Stores all Command pieces
 * @since 1.0.0
 */
declare class CommandStore extends AliasStore<Command> {
    constructor();
}

/**
 * The base event class. This class is abstract and is to be extended by subclasses, which should implement the methods. In
 * Sapphire's workflow, events are called when the emitter they listen on emits a new message with the same event name.
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { Event, Events, PieceContext } from '(at)sapphire/framework';
 *
 * // Define a class extending `CoreEvent`, then export it.
 * // NOTE: You can use `export default` or `export =` too.
 * export class CoreEvent extends Event<Events.Ready> {
 *   public constructor(context: PieceContext) {
 *     super(context, { event: Events.Ready, once: true });
 *   }
 *
 *   public run() {
 *     if (!this.client.id) this.client.id = this.client.user?.id ?? null;
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { Event, Events } = require('(at)sapphire/framework');
 *
 * // Define a class extending `CoreEvent`, then export it.
 * module.exports = class CoreEvent extends Event {
 *   constructor(context) {
 *     super(context, { event: Events.Ready, once: true });
 *   }
 *
 *   run() {
 *     if (!this.client.id) this.client.id = this.client.user?.id ?? null;
 *   }
 * }
 * ```
 */
declare abstract class Event<E extends keyof ClientEvents | symbol = ''> extends Piece {
    #private;
    readonly emitter: EventEmitter | null;
    readonly event: string;
    readonly once: boolean;
    constructor(context: PieceContext, options?: EventOptions);
    abstract run(...args: E extends keyof ClientEvents ? ClientEvents[E] : unknown[]): unknown;
    onLoad(): void;
    onUnload(): void;
    toJSON(): Record<PropertyKey, unknown>;
    private _run;
    private _runOnce;
}
interface EventOptions extends PieceOptions {
    readonly emitter?: keyof Client | EventEmitter;
    readonly event?: string;
    readonly once?: boolean;
}

declare class EventStore extends Store<Event> {
    constructor();
}

declare class PreconditionStore extends Store<Precondition> {
    private readonly globalPreconditions;
    constructor();
    run(message: Message, command: Command, context?: PreconditionContext): AsyncPreconditionResult;
    set(key: string, value: Precondition): this;
    delete(key: string): boolean;
    clear(): void;
}

declare type Key = keyof StoreRegistryEntries;
declare type Value = StoreRegistryEntries[Key];
/**
 * A strict-typed store registry. This is available in both [[Client.stores]] and [[Store.injectedContext]].
 * @since 1.0.0
 * @example
 * ```typescript
 * // Adding new stores
 *
 * // Register the store:
 * Store.injectedContext.stores.register(new RouteStore());
 *
 * // Augment Sapphire to add the new store, in case of a JavaScript
 * // project, this can be moved to an `Augments.d.ts` (or any other name)
 * // file somewhere:
 * declare module '(at)sapphire/framework' {
 *   export interface StoreRegistryEntries {
 *     routes: RouteStore;
 *   }
 * }
 * ```
 */
declare class StoreRegistry extends Collection$1<Key, Value> {
    /**
     * Registers all user directories from the process working directory, the default value is obtained by assuming
     * CommonJS (high accuracy) but with fallback for ECMAScript Modules (reads package.json's `main` entry, fallbacks
     * to `process.cwd()`).
     *
     * By default, if you have this folder structure:
     * ```
     * /home/me/my-bot
     * ├─ src
     * │  ├─ commands
     * │  ├─ events
     * │  └─ main.js
     * └─ package.json
     * ```
     *
     * And you run `node src/main.js`, the directories `/home/me/my-bot/src/commands` and `/home/me/my-bot/src/events` will
     * be registered for the commands and events stores respectively, since both directories are located in the same
     * directory as your main file.
     *
     * **Note**: this also registers directories for all other stores, even if they don't have a folder, this allows you
     * to create new pieces and hot-load them later anytime.
     * @since 1.0.0
     * @param rootDirectory The root directory to register pieces at.
     */
    registerUserDirectories(rootDirectory?: string): void;
    /**
     * Registers a store.
     * @since 1.0.0
     * @param store The store to register.
     */
    register<T extends Piece>(store: Store<T>): this;
    /**
     * Deregisters a store.
     * @since 1.0.0
     * @param store The store to deregister.
     */
    deregister<T extends Piece>(store: Store<T>): this;
}
interface StoreRegistry {
    get<K extends Key>(key: K): StoreRegistryEntries[K];
    get(key: string): undefined;
    has(key: Key): true;
    has(key: string): false;
}
/**
 * The [[StoreRegistry]]'s registry, use module augmentation against this interface when adding new stores.
 * @since 1.0.0
 */
interface StoreRegistryEntries {
    arguments: ArgumentStore;
    commands: CommandStore;
    events: EventStore;
    preconditions: PreconditionStore;
}

/**
 * The logger levels for the [[ILogger]].
 */
declare const enum LogLevel {
    /**
     * The lowest log level, used when calling [[ILogger.trace]].
     */
    Trace = 10,
    /**
     * The debug level, used when calling [[ILogger.debug]].
     */
    Debug = 20,
    /**
     * The info level, used when calling [[ILogger.info]].
     */
    Info = 30,
    /**
     * The warning level, used when calling [[ILogger.warn]].
     */
    Warn = 40,
    /**
     * The error level, used when calling [[ILogger.error]].
     */
    Error = 50,
    /**
     * The critical level, used when calling [[ILogger.fatal]].
     */
    Fatal = 60,
    /**
     * An unknown or uncategorized level.
     */
    None = 100
}
interface ILogger {
    /**
     * Alias of [[ILogger.write]] with [[LogLevel.Trace]] as level.
     * @param values The values to log.
     */
    trace(...values: readonly unknown[]): void;
    /**
     * Alias of [[ILogger.write]] with [[LogLevel.Debug]] as level.
     * @param values The values to log.
     */
    debug(...values: readonly unknown[]): void;
    /**
     * Alias of [[ILogger.write]] with [[LogLevel.Info]] as level.
     * @param values The values to log.
     */
    info(...values: readonly unknown[]): void;
    /**
     * Alias of [[ILogger.write]] with [[LogLevel.Warn]] as level.
     * @param values The values to log.
     */
    warn(...values: readonly unknown[]): void;
    /**
     * Alias of [[ILogger.write]] with [[LogLevel.Error]] as level.
     * @param values The values to log.
     */
    error(...values: readonly unknown[]): void;
    /**
     * Alias of [[ILogger.write]] with [[LogLevel.Fatal]] as level.
     * @param values The values to log.
     */
    fatal(...values: readonly unknown[]): void;
    /**
     * Writes the log message given a level and the value(s).
     * @param level The log level.
     * @param values The values to log.
     */
    write(level: LogLevel, ...values: readonly unknown[]): void;
}

/**
 * A valid prefix in Sapphire.
 * * `string`: a single prefix, e.g. `'!'`.
 * * `string[]`: an array of prefixes, e.g. `['!', '.']`.
 * * `null`: disabled prefix, locks the bot's command usage to mentions only.
 */
declare type SapphirePrefix = string | readonly string[] | null;
interface SapphirePrefixHook {
    (message: Message): Awaited<SapphirePrefix>;
}
interface SapphireClientOptions {
    /**
     * The base user directory, if set to `null`, Sapphire will not call [[SapphireClient.registerUserDirectories]],
     * meaning that you will need to manually set each folder for each store. Please read the aforementioned method's
     * documentation for more information.
     * @since 1.0.0
     * @default undefined
     */
    baseUserDirectory?: string | null;
    /**
     * Whether commands can be case insensitive
     * @since 1.0.0
     * @default false
     */
    caseInsensitiveCommands?: boolean | null;
    /**
     * Whether prefixes can be case insensitive
     * @since 1.0.0
     * @default false
     */
    caseInsensitivePrefixes?: boolean | null;
    /**
     * The default prefix, in case of `null`, only mention prefix will trigger the bot's commands.
     * @since 1.0.0
     * @default null
     */
    defaultPrefix?: SapphirePrefix;
    /**
     * The regex prefix, an alternative to a mention or regular prefix to allow creating natural language command messages
     * @since 1.0.0
     * @example
     * ```ts
     * /^(hey +)?bot[,! ]/i
     *
     * // Matches:
     * // - hey bot,
     * // - hey bot!
     * // - hey bot
     * // - bot,
     * // - bot!
     * // - bot
     * ```
     */
    regexPrefix?: RegExp;
    /**
     * The prefix hook, by default it is a callback function that returns [[SapphireClientOptions.defaultPrefix]].
     * @since 1.0.0
     * @default () => client.options.defaultPrefix
     */
    fetchPrefix?: SapphirePrefixHook;
    /**
     * The client's ID, this is automatically set by the CoreReady event.
     * @since 1.0.0
     * @default this.client.user?.id ?? null
     */
    id?: string;
    /**
     * The logger options, defaults to an instance of [[Logger]] when [[ClientLoggerOptions.instance]] is not specified.
     * @since 1.0.0
     * @default { instance: new Logger(LogLevel.Info) }
     */
    logger?: ClientLoggerOptions;
    /**
     * If Sapphire should load our pre-included error event listeners that log any encountered errors to the [[SapphireClient.logger]] instance
     * @since 1.0.0
     * @default true
     */
    loadDefaultErrorEvents?: boolean;
}
/**
 * The base [[Client]] extension that makes Sapphire work. When building a Discord bot with the framework, the developer
 * must either use this class, or extend it.
 *
 * Sapphire also automatically detects the folders to scan for pieces, please read
 * [[SapphireClient.registerUserDirectories]] for reference. This method is called at the start of the
 * [[SapphireClient.login]] method.
 *
 * @since 1.0.0
 * @example
 * ```typescript
 * const client = new SapphireClient({
 *   presence: {
 *     activity: {
 *       name: 'for commands!',
 *       type: 'LISTENING'
 *     }
 *   }
 * });
 *
 * client.login(process.env.DISCORD_TOKEN)
 *   .catch(console.error);
 * ```
 *
 * @example
 * ```typescript
 * // Automatically scan from a specific directory, e.g. the main
 * // file is at `/home/me/bot/index.js` and all your pieces are at
 * // `/home/me/bot/pieces` (e.g. `/home/me/bot/pieces/commands/MyCommand.js`):
 * const client = new SapphireClient({
 *   baseUserDirectory: join(__dirname, 'pieces'),
 *   // More options...
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Opt-out automatic scanning:
 * const client = new SapphireClient({
 *   baseUserDirectory: null,
 *   // More options...
 * });
 * ```
 */
declare class SapphireClient extends Client {
    /**
     * The client's ID, used for the user prefix.
     * @since 1.0.0
     */
    id: string | null;
    /**
     * The method to be overriden by the developer.
     * @since 1.0.0
     * @return A string for a single prefix, an array of strings for matching multiple, or null for no match (mention prefix only).
     * @example
     * ```typescript
     * // Return always the same prefix (unconfigurable):
     * client.fetchPrefix = () => '!';
     * ```
     * @example
     * ```typescript
     * // Retrieving the prefix from a SQL database:
     * client.fetchPrefix = async (message) => {
     *   // note: driver is something generic and depends on how you connect to your database
     *   const guild = await driver.getOne('SELECT prefix FROM public.guild WHERE id = $1', [message.guild.id]);
     *   return guild?.prefix ?? '!';
     * };
     * ```
     * @example
     * ```typescript
     * // Retrieving the prefix from an ORM:
     * client.fetchPrefix = async (message) => {
     *   // note: driver is something generic and depends on how you connect to your database
     *   const guild = await driver.getRepository(GuildEntity).findOne({ id: message.guild.id });
     *   return guild?.prefix ?? '!';
     * };
     * ```
     */
    fetchPrefix: SapphirePrefixHook;
    /**
     * The logger to be used by the framework and plugins. By default, a [[Logger]] instance is used, which emits the
     * messages to the console.
     * @since 1.0.0
     */
    logger: ILogger;
    /**
     * The registered stores.
     * @since 1.0.0
     */
    stores: StoreRegistry;
    constructor(options?: ClientOptions);
    /**
     * Loads all pieces, then logs the client in, establishing a websocket connection to Discord.
     * @since 1.0.0
     * @param token Token of the account to log in with.
     * @return Token of the account used.
     */
    login(token?: string): Promise<string>;
    static plugins: PluginManager;
    static use(plugin: typeof Plugin): typeof SapphireClient;
}
interface ClientLoggerOptions {
    level?: LogLevel;
    instance?: ILogger;
}
declare module 'discord.js' {
    interface Client {
        id: string | null;
        logger: ILogger;
        stores: StoreRegistry;
        fetchPrefix: SapphirePrefixHook;
    }
    interface ClientOptions extends SapphireClientOptions {
    }
}
declare module '@sapphire/pieces' {
    interface Container {
        client: SapphireClient;
        logger: ILogger;
        stores: StoreRegistry;
    }
}

declare const preGenericsInitialization: unique symbol;
declare const preInitialization: unique symbol;
declare const postInitialization: unique symbol;
declare const preLogin: unique symbol;
declare const postLogin: unique symbol;

declare abstract class Plugin {
    static [preGenericsInitialization]?: (this: SapphireClient, options: ClientOptions) => void;
    static [preInitialization]?: (this: SapphireClient, options: ClientOptions) => void;
    static [postInitialization]?: (this: SapphireClient, options: ClientOptions) => void;
    static [preLogin]?: (this: SapphireClient, options: ClientOptions) => Awaited<void>;
    static [postLogin]?: (this: SapphireClient, options: ClientOptions) => Awaited<void>;
}

/**
 * The extended argument class. This class is abstract and is to be extended by subclasses which
 * will implement the [[ExtendedArgument#handle]] method.
 * Much like the [[Argument]] class, this class handles parsing user-specified command arguments
 * into typed command parameters. However, this class can be used to expand upon an existing
 * argument in order to process its transformed value rather than just the argument string.
 *
 * @example
 * ```typescript
 * // TypeScript:
 * import { ApplyOptions } from '@sapphire/decorators';
 * import { ArgumentResult, ExtendedArgument, ExtendedArgumentContext, ExtendedArgumentOptions } from '(at)sapphire/framework';
 * import type { Channel, TextChannel } from 'discord.js';
 *
 * // Just like with `Argument`, you can use `export default` or `export =` too.
 * @ApplyOptions<ExtendedArgumentOptions>({
 *   name: 'textChannel',
 *   baseArgument: 'channel'
 * })
 * export class TextChannelArgument extends ExtendedArgument<'channel', TextChannel> {
 *   public handle(parsed: Channel, { argument }: ExtendedArgumentContext): ArgumentResult<TextChannel> {
 *     return parsed.type === 'text'
 *       ? this.ok(parsed as TextChannel)
 *       : this.error(argument, 'ArgumentTextChannelInvalidTextChannel', 'The argument did not resolve to a text channel.');
 *   }
 * }
 * ```
 *
 * @example
 * ```javascript
 * // JavaScript:
 * const { ExtendedArgument } = require('(at)sapphire/framework');
 *
 * module.exports = class TextChannelArgument extends ExtendedArgument {
 *   constructor(context) {
 *     super(context, { name: 'textChannel', baseArgument: 'channel' });
 *   }
 *
 *   handle(parsed, { argument }) {
 *     return parsed.type === 'text'
 *       ? this.ok(parsed)
 *       : this.error(argument, 'ArgumentTextChannelInvalidTextChannel', 'The argument did not resolve to a text channel/');
 *   }
 * }
 * ```
 */
declare abstract class ExtendedArgument<K extends keyof ArgType, T> extends Argument<T> {
    baseArgument: K;
    constructor(context: PieceContext, options: ExtendedArgumentOptions<K>);
    /**
     * Represents the underlying argument that transforms the raw argument
     * into the value used to compute the extended argument's value.
     */
    get base(): IArgument<ArgType[K]>;
    run(parameter: string, context: ArgumentContext<T>): AsyncArgumentResult<T>;
    abstract handle(parsed: ArgType[K], context: ExtendedArgumentContext): ArgumentResult<T>;
}
interface ExtendedArgumentOptions<K extends keyof ArgType> extends ArgumentOptions {
    /**
     * The name of the underlying argument whose value is used to compute
     * the extended argument value; see [[ArgType]] for valid keys.
     */
    baseArgument: K;
}
interface ExtendedArgumentContext extends ArgumentContext {
    /**
     * The canonical parameter specified by the user in the command, as
     * a string, equivalent to the first parameter of [[Argument#run]].
     * This allows [[ExtendedArgument#handle]] to access the original
     * argument, which is useful for returning [[Argument#error]] so
     * that you don't have to convert the parsed argument back into a
     * string.
     */
    parameter: string;
}

declare enum Events {
    ChannelCreate = "channelCreate",
    ChannelDelete = "channelDelete",
    ChannelPinsUpdate = "channelPinsUpdate",
    ChannelUpdate = "channelUpdate",
    Debug = "debug",
    Warn = "warn",
    Disconnect = "disconnect",
    EmojiCreate = "emojiCreate",
    EmojiDelete = "emojiDelete",
    EmojiUpdate = "emojiUpdate",
    Error = "error",
    GuildBanAdd = "guildBanAdd",
    GuildBanRemove = "guildBanRemove",
    GuildCreate = "guildCreate",
    GuildDelete = "guildDelete",
    GuildUnavailable = "guildUnavailable",
    GuildIntegrationsUpdate = "guildIntegrationsUpdate",
    GuildMemberAdd = "guildMemberAdd",
    GuildMemberAvailable = "guildMemberAvailable",
    GuildMemberRemove = "guildMemberRemove",
    GuildMembersChunk = "guildMembersChunk",
    GuildMemberSpeaking = "guildMemberSpeaking",
    GuildMemberUpdate = "guildMemberUpdate",
    GuildUpdate = "guildUpdate",
    InviteCreate = "inviteCreate",
    InviteDelete = "inviteDelete",
    Message = "message",
    MessageDelete = "messageDelete",
    MessageReactionRemoveAll = "messageReactionRemoveAll",
    MessageReactionRemoveEmoji = "messageReactionRemoveEmoji",
    MessageDeleteBulk = "messageDeleteBulk",
    MessageReactionAdd = "messageReactionAdd",
    MessageReactionRemove = "messageReactionRemove",
    MessageUpdate = "messageUpdate",
    PresenceUpdate = "presenceUpdate",
    RateLimit = "rateLimit",
    Ready = "ready",
    Invalidated = "invalidated",
    RoleCreate = "roleCreate",
    RoleDelete = "roleDelete",
    RoleUpdate = "roleUpdate",
    TypingsStart = "typingStart",
    UserUpdate = "userUpdate",
    VoiceStateUpdate = "voiceStateUpdate",
    WebhookUpdate = "webhookUpdate",
    ShardDisconnect = "shardDisconnect",
    ShardError = "shardError",
    ShardReady = "shardReady",
    ShardReconnecting = "shardReconnecting",
    ShardResume = "shardResume",
    PieceUnload = "pieceUnload",
    PiecePostLoad = "piecePostLoad",
    MentionPrefixOnly = "mentionPrefixOnly",
    EventError = "eventError",
    PreMessageParsed = "preMessageParsed",
    PrefixedMessage = "prefixedMessage",
    UnknownCommandName = "unknownCommandName",
    UnknownCommand = "unknownCommand",
    PreCommandRun = "preCommandRun",
    CommandDenied = "commandDenied",
    CommandAccepted = "commandAccepted",
    CommandRun = "commandRun",
    CommandSuccess = "commandSuccess",
    CommandFinish = "commandFinish",
    CommandError = "commandError",
    PluginLoaded = "pluginLoaded",
    NonePrefixedMessage = "nonePrefixedMessage"
}
interface IPieceError {
    piece: Piece;
}
interface EventErrorPayload extends IPieceError {
    piece: Event;
}
interface UnknownCommandNamePayload {
    message: Message;
    prefix: string | RegExp;
    commandPrefix: string;
}
interface UnknownCommandPayload extends UnknownCommandNamePayload {
    commandName: string;
}
interface ICommandPayload {
    message: Message;
    command: Command;
}
interface PreCommandRunPayload extends CommandDeniedPayload {
}
interface CommandDeniedPayload extends ICommandPayload {
    parameters: string;
    context: CommandContext;
}
interface CommandAcceptedPayload extends ICommandPayload {
    parameters: string;
    context: CommandContext;
}
interface CommandRunPayload<T extends Args = Args> extends CommandAcceptedPayload {
    args: T;
}
interface CommandFinishPayload<T extends Args = Args> extends CommandRunPayload<T> {
}
interface CommandErrorPayload<T extends Args = Args> extends CommandRunPayload<T> {
    piece: Command;
}
interface CommandSuccessPayload<T extends Args = Args> extends CommandRunPayload<T> {
    result: unknown;
}
declare module 'discord.js' {
    interface ClientEvents {
        [Events.PieceUnload]: [store: Store<Piece>, piece: Piece];
        [Events.PiecePostLoad]: [store: Store<Piece>, piece: Piece];
        [Events.MentionPrefixOnly]: [message: Message];
        [Events.EventError]: [error: Error, payload: EventErrorPayload];
        [Events.PreMessageParsed]: [message: Message];
        [Events.PrefixedMessage]: [message: Message, prefix: string | RegExp];
        [Events.UnknownCommandName]: [payload: UnknownCommandNamePayload];
        [Events.UnknownCommand]: [payload: UnknownCommandPayload];
        [Events.PreCommandRun]: [payload: PreCommandRunPayload];
        [Events.CommandDenied]: [error: UserError, payload: CommandDeniedPayload];
        [Events.CommandAccepted]: [payload: CommandAcceptedPayload];
        [Events.CommandRun]: [message: Message, command: Command, payload: CommandRunPayload];
        [Events.CommandSuccess]: [payload: CommandSuccessPayload];
        [Events.CommandError]: [error: Error, payload: CommandErrorPayload];
        [Events.CommandFinish]: [message: Message, command: Command, payload: CommandFinishPayload];
        [Events.PluginLoaded]: [hook: PluginHook, name: string | undefined];
        [Events.NonePrefixedMessage]: [message: Message];
        [K: string]: unknown[];
    }
}

declare class Logger implements ILogger {
    level: LogLevel;
    constructor(level: LogLevel);
    trace(...values: readonly unknown[]): void;
    debug(...values: readonly unknown[]): void;
    info(...values: readonly unknown[]): void;
    warn(...values: readonly unknown[]): void;
    error(...values: readonly unknown[]): void;
    fatal(...values: readonly unknown[]): void;
    write(level: LogLevel, ...values: readonly unknown[]): void;
    protected static readonly levels: Map<LogLevel, LogMethods>;
}
declare type LogMethods = 'trace' | 'debug' | 'info' | 'warn' | 'error';

/**
 * An [[IPreconditionCondition]] which runs all containers similarly to doing (V0 && V1 [&& V2 [&& V3 ...]]).
 * @since 1.0.0
 */
declare const PreconditionConditionAnd: IPreconditionCondition;

/**
 * An [[IPreconditionCondition]] which runs all containers similarly to doing (V0 || V1 [|| V2 [|| V3 ...]]).
 * @since 1.0.0
 */
declare const PreconditionConditionOr: IPreconditionCondition;

/**
 * Constructs a contextful permissions precondition requirement.
 * @since 1.0.0
 * @example
 * ```typescript
 * export class CoreCommand extends Command {
 *   public constructor(context: PieceContext) {
 *     super(context, {
 *       preconditions: [
 *         'GuildOnly',
 *         new PermissionsPrecondition('ADD_REACTIONS')
 *       ]
 *     });
 *   }
 *
 *   public run(message: Message, args: Args) {
 *     // ...
 *   }
 * }
 * ```
 */
declare class PermissionsPrecondition implements PreconditionSingleResolvableDetails {
    name: string;
    context: Record<PropertyKey, unknown>;
    /**
     * Constructs a precondition container entry.
     * @param permissions The permissions that will be required by this command.
     */
    constructor(permissions: PermissionResolvable);
}

declare const version = "[VI]{version}[/VI]";

export { ArgOptions, ArgType, Args, ArgsNextCallback, Argument, ArgumentContext, ArgumentError, ArgumentOptions, ArgumentResult, ArgumentStore, AsyncArgumentResult, AsyncPluginHooks, AsyncPreconditionContainerReturn, AsyncPreconditionResult, BucketType, ClientLoggerOptions, Command, CommandAcceptedPayload, CommandContext, CommandDeniedPayload, CommandErrorPayload, CommandFinishPayload, CommandOptions, CommandOptionsRunType, CommandPreConditions, CommandRunPayload, CommandStore, CommandSuccessPayload, CooldownLevel, Err, Event, EventErrorPayload, EventOptions, EventStore, Events, ExtendedArgument, ExtendedArgumentContext, ExtendedArgumentOptions, IArgument, ICommandPayload, ILogger, IPieceError, IPreconditionCondition, IPreconditionContainer, Identifiers, LogLevel, LogMethods, Logger, Maybe, None, Ok, PermissionsPrecondition, Plugin, PluginHook, PluginManager, PreCommandRunPayload, Precondition, PreconditionArrayResolvable, PreconditionArrayResolvableDetails, PreconditionConditionAnd, PreconditionConditionOr, PreconditionContainerArray, PreconditionContainerResult, PreconditionContainerReturn, PreconditionContainerSingle, PreconditionContext, PreconditionEntryResolvable, PreconditionError, PreconditionOptions, PreconditionResult, PreconditionRunCondition, PreconditionRunMode, PreconditionSingleResolvable, PreconditionSingleResolvableDetails, PreconditionStore, RepeatArgOptions, Result, SapphireClient, SapphireClientOptions, SapphirePluginAsyncHook, SapphirePluginHook, SapphirePluginHookEntry, SapphirePrefix, SapphirePrefixHook, Some, StoreRegistry, StoreRegistryEntries, SyncPluginHooks, UnknownCommandNamePayload, UnknownCommandPayload, UserError, err, isErr, isMaybe, isNone, isOk, isSome, maybe, none, ok, postInitialization, postLogin, preGenericsInitialization, preInitialization, preLogin, some, version };
