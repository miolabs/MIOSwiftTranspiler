const assert = require('assert')
const execSync = require('child_process').execSync
const fs = require('fs')
const root = require('path').normalize(__dirname + '/../')

const includeDefinitions = ['min','min','max','max','_ArrayBridgeStorage','_arrayDownCastIndirect','_arrayForceCast','_arrayDownCastConditionalIndirect','_arrayConditionalCast','_bridgeCocoaArray','_allocateUninitializedArray','_deallocateUninitializedArray','_expectEndOfIs','_growArrayCapacity','assertFileLine','preconditionFileLine','assertionFailureFileLine','preconditionFailureFileLine','fatalErrorFileLine','_preconditionFileLine','_preconditionFailureFileLine','_overflowCheckedFileLine','_debugPreconditionFileLine','_debugPreconditionFailureFileLine','_internalInvariantFileLine','_internalInvariantFailureFileLine','_isDebugAssertConfiguration','_isReleaseAssertConfiguration','_isFastAssertConfiguration','_isStdlibInternalChecksEnabled','_fatalErrorFlags','_assertionFailureFileLineFlags','_assertionFailureFileLineFlags','_assertionFailureFlags','_fatalErrorMessageFileLineFlags','_unimplementedInitializerClassNameInitNameFileLineColumn','_undefinedFileLine','_diagnoseUnexpectedEnumCaseValueTypeRawValue','_diagnoseUnexpectedEnumCaseType','_swift_stdlib_atomicCompareExchangeStrongIntObjectExpectedDesired','_swift_stdlib_atomicLoadIntObject','_swift_stdlib_atomicStoreIntObjectDesired','_swift_stdlib_atomicFetchAddIntObjectOperand','_swift_stdlib_atomicFetchAddInt32ObjectOperand','_swift_stdlib_atomicFetchAddInt64ObjectOperand','_swift_stdlib_atomicFetchAndIntObjectOperand','_swift_stdlib_atomicFetchAndInt32ObjectOperand','_swift_stdlib_atomicFetchAndInt64ObjectOperand','_swift_stdlib_atomicFetchOrIntObjectOperand','_swift_stdlib_atomicFetchOrInt32ObjectOperand','_swift_stdlib_atomicFetchOrInt64ObjectOperand','_swift_stdlib_atomicFetchXorIntObjectOperand','_swift_stdlib_atomicFetchXorInt32ObjectOperand','_swift_stdlib_atomicFetchXorInt64ObjectOperand','_bridgeAnythingToObjectiveC','_bridgeAnythingNonVerbatimToObjectiveC','_bridgeAnyObjectToAny','_forceBridgeFromObjectiveC','_forceBridgeFromObjectiveC_bridgeable','_conditionallyBridgeFromObjectiveC','_conditionallyBridgeFromObjectiveC_bridgeable','_bridgeNonVerbatimFromObjectiveC','_bridgeNonVerbatimFromObjectiveCToAny','_bridgeNonVerbatimBoxedValue','_bridgeNonVerbatimFromObjectiveCConditional','_isBridgedToObjectiveC','_isBridgedNonVerbatimToObjectiveC','_isBridgedVerbatimToObjectiveC','_getBridgedObjectiveCType','_getBridgedNonVerbatimObjectiveCType','_getObjCTypeEncoding','_BridgingBuffer','_roundUpImplToAlignment','_roundUpToAlignment','_roundUpToAlignment','_canBeClass','unsafeBitCastTo','_identityCastTo','_reinterpretCastToAnyObject','infix_61_61','infix_33_61','infix_61_61','infix_33_61','infix_61_61','infix_33_61','_unreachable','_conditionallyUnreachable','_swift_isClassOrObjCExistentialType','_isClassOrObjCExistential','_unsafeReferenceCastTo','unsafeDowncastTo','_unsafeUncheckedDowncastTo','_getUnsafePointerToStoredProperties','_branchHintExpected','_fastPath','_slowPath','_onFastPath','_uncheckedUnsafeAssume','_usesNativeSwiftReferenceCounting','getSwiftClassInstanceExtents','getObjCClassInstanceExtents','_class_getInstancePositiveExtentSize','_isValidAddress','_bridgeObjectTaggedPointerBits','_objCTaggedPointerBits','_objectPointerSpareBits','_objectPointerLowSpareBitShift','_objectPointerIsObjCBit','_bitPattern','_nonPointerBits','_isObjCTaggedPointer','_isObjCTaggedPointer','_isTaggedObject','_isNativePointer','_isNonTaggedObjCPointer','_getNonTagBits','_bridgeObjectFromNative','_bridgeObjectFromNonTaggedObjC','_bridgeObjectFromTagged','_bridgeObjectTaggingPayload','_bridgeObjectToNative','_bridgeObjectToNonTaggedObjC','_bridgeObjectToTagged','_bridgeObjectToTagPayload','_bridgeObjectFromNativeObject','_nativeObjectFromNative','_nativeObjectFromBridge','_nativeObjectToNative','_makeNativeBridgeObject','_makeObjCBridgeObject','_makeBridgeObject','_swift_class_getSuperclass','_getSuperclass','_getSuperclass','_isUnique','_reallocObject','_isUnique_native','_isPOD','_isBitwiseTakable','_isOptional','_unsafeDowncastToAnyObjectFromAny','_trueAfterDiagnostics','typeOf','withoutActuallyEscapingDo','_openExistentialDo','_cos','_cos','_cos','_sin','_sin','_sin','_exp','_exp','_exp','_exp2','_exp2','_exp2','_log','_log','_log','_log10','_log10','_log10','_log2','_log2','_log2','_nearbyint','_nearbyint','_nearbyint','_rint','_rint','_rint','Codable','infix_61_61','infix_33_61','infix_33_61','CountableClosedRange','_emptyArrayStorage','infix_43_61','_copySequenceToContiguousArray','_copyCollectionToContiguousArray','CChar','CUnsignedChar','CUnsignedShort','CUnsignedInt','CUnsignedLong','CUnsignedLongLong','CSignedChar','CShort','CInt','CLong','CLongLong','CFloat','CDouble','CLongDouble','CWideChar','CChar16','CChar32','CBool','_memcpyDestSrcSize','_memmoveDestSrcSize','_stringForPrintObject','_debuggerTestingCheckExpect','_getRetainCount','_getUnownedRetainCount','_getWeakRetainCount','DictionaryIndex','DictionaryIterator','_stdlib_NSDictionary_allKeys','_dictionaryUpCast','_dictionaryDownCastIndirect','_dictionaryDownCast','_dictionaryDownCastConditionalIndirect','_dictionaryDownCastConditional','LazyDropWhileCollection','dumpToNameIndentMaxDepthMaxItems','dumpNameIndentMaxDepthMaxItems','_dump_unlockedToNameIndentMaxDepthMaxItemCounterVisitedItems','_dumpSuperclass_unlockedMirrorToIndentMaxDepthMaxItemCounterVisitedItems','infix_61_61_61','infix_33_61_61','_getErrorDomainNSString','_getErrorCode','_getErrorUserInfoNSDictionary','_getErrorEmbeddedNSErrorIndirect','_getErrorEmbeddedNSError','_getErrorDefaultUserInfo','_bridgeErrorToNSError','_unexpectedErrorFilenameStartFilenameLengthFilenameIsASCIILine','_errorInMain','_getDefaultErrorCode','LazyFilterCollection','FlattenCollection','_isspace_clocale','infix_37','infix_37_61','_hashValueFor','Hashable_isEqual_indirect','Hashable_hashValue_indirect','_makeAnyHashableUsingDefaultRepresentationOfStoringResultInto','_makeAnyHashableUpcastingToHashableBaseTypeStoringResultInto','_convertToAnyHashable','_convertToAnyHashableIndirect','_anyHashableDownCastConditionalIndirect','_loadPartialUnalignedUInt64LEByteCount','_hashContainerDefaultMaxLoadFactorInverse','_stdlib_NSObject_isEqual','readLineStrippingNewline','_ascii16','_asciiDigitCodeUnitRadix','_parseUnsignedASCIIFirstRestRadixPositive','_parseASCIICodeUnitsRadix','abs','numericCast','IntMax','UIntMax','_assumeNonNegative','_assumeNonNegative','_assumeNonNegative','_assumeNonNegative','_assumeNonNegative','_unsafePlus','_unsafeMinus','_abstractMethodNameFileLine','KeyPathComputedArgumentLayoutFn','KeyPathComputedArgumentInitializerFn','_popFromAs','_popFromAsCount','_getAtPartialKeyPathRootKeyPath','_getAtAnyKeyPathRootKeyPath','_getAtKeyPathRootKeyPath','_modifyAtWritableKeyPath_implRootKeyPath','_modifyAtReferenceWritableKeyPath_implRootKeyPath','_setAtWritableKeyPathRootKeyPathValue','_setAtReferenceWritableKeyPathRootKeyPathValue','_tryToAppendKeyPathsRootLeaf','_appendingKeyPathsRootLeaf','keyPathObjectHeaderSize','keyPathPatternHeaderSize','_swift_getKeyPathPatternArguments','MetadataReference','_getSymbolicMangledNameLength','_getTypeByMangledNameInEnvironmentOrContextGenericEnvironmentOrContextGenericArguments','_resolveKeyPathGenericArgReferenceGenericEnvironmentArguments','_resolveKeyPathMetadataReferenceGenericEnvironmentArguments','_resolveRelativeAddress','_resolveRelativeIndirectableAddress','_loadRelativeAddressAtFromByteOffsetAs','_walkKeyPathPatternWalker','_getKeyPathClassAndInstanceSizeFromPattern','_instantiateKeyPathBuffer','LazyCollection','withExtendedLifetime','withExtendedLifetime','_fixLifetime','withUnsafeMutablePointerTo','withUnsafePointerTo','withUnsafePointerTo','_HeapObject','_swift_bufferAllocateBufferTypeSizeAlignmentMask','tryReallocateUniquelyReferencedBufferNewMinimumCapacity','isKnownUniquelyReferenced','isKnownUniquelyReferenced','LazyMapCollection','_isPowerOf2','_isPowerOf2','_autorelease','_withUninitializedString','_getTypeNameQualified','_typeNameQualified','_typeByName','_getTypeByMangledNameUntrusted','_getTypeByMangledNameInEnvironmentGenericEnvironmentGenericArguments','_getTypeByMangledNameInContextGenericContextGenericArguments','swap','KEY_TYPE_OF_DICTIONARY_VIOLATES_HASHABLE_REQUIREMENTS','ELEMENT_TYPE_OF_SET_VIOLATES_HASHABLE_REQUIREMENTS','_unsafeMutableBufferPointerCastTo','_unsafeBufferPointerCastTo','_castOutputBufferEndingAt','_castOutputBufferEndingAt','_diagnoseUnexpectedNilOptional_filenameStart_filenameLength_filenameIsASCII_line_isImplicitUnwrap','infix_63_63','infix_63_63','_getEnumCaseName','_opaqueSummary','_adHocPrint_unlockedIsDebugPrint','_print_unlocked','_debugPrint_unlocked','_dumpPrint_unlocked','_playgroundPrintHook','_convertPointerToPointerArgument','_convertInOutToPointerArgument','_convertConstArrayToPointerArgument','_convertMutableArrayToPointerArgument','_convertConstStringToUTF8PointerArgument','Void','Float32','Float64','IntegerLiteralType','FloatLiteralType','BooleanLiteralType','UnicodeScalarType','ExtendedGraphemeClusterType','StringLiteralType','_MaxBuiltinFloatType','AnyObject','AnyClass','infix_126_61','LazyPrefixWhileCollection','printSeparatorTerminator','debugPrintSeparatorTerminator','printSeparatorTerminatorTo','debugPrintSeparatorTerminatorTo','_printSeparatorTerminatorTo','_debugPrintSeparatorTerminatorTo','UnboundedRange','CountableRange','CountablePartialRangeFrom','_getNormalizedTypeType','_getChildCountType','NameFreeFunc','_getChildOfTypeIndexOutNameOutFreeFunc','_getDisplayStyle','getChildOfTypeIndex','_getQuickLookObject','_isImplKindOf','_isKindOf','_getClassPlaygroundQuickLook','repeatElementCount','_replPrintLiteralString','_replDebugPrintln','_stdlib_atomicCompareExchangeStrongPtrObjectExpectedDesired','_stdlib_atomicCompareExchangeStrongPtrObjectExpectedDesired','_stdlib_atomicCompareExchangeStrongPtrObjectExpectedDesired','_stdlib_atomicInitializeARCRefObjectDesired','_stdlib_atomicLoadARCRefObject','_float32ToStringImpl','_float32ToStringDebug','_float64ToStringImpl','_float64ToStringDebug','_float80ToStringImpl','_float80ToStringDebug','_int64ToStringImpl','_int64ToStringRadixUppercase','_uint64ToStringImpl','_uint64ToStringRadixUppercase','_rawPointerToString','_stdlib_initializeReturnAutoreleased','_collectAllReferencesInsideObjectImplReferencesVisitedItems','_collectReferencesInsideObject','_measureRuntimeFunctionCountersDiffsObjects','SetIndex','SetIterator','_stdlib_CFSetGetValues','_stdlib_NSSet_allObjects','_setUpCast','_setDownCastIndirect','_setDownCast','_setDownCastConditionalIndirect','_setDownCastConditional','_SwiftNSZone','_makeSwiftNSFastEnumerationState','_fastEnumerationStorageMutationsTarget','_fastEnumerationStorageMutationsPtr','_bytesToUInt64','_mergeLowMidHighBufferBy','_minimumMergeRunLength','_findNextRunInFromBy','strideFromToBy','strideFromThroughBy','unimplemented_utf8_32bitFileLine','_CocoaString','_stdlib_binary_CFStringCreateCopy','_stdlib_binary_CFStringGetLength','_stdlib_binary_CFStringGetCharactersPtr','_cocoaStringCopyCharactersFromRangeInto','_cocoaStringSubscript','_cocoaStringCompare','_cocoaHashString','_cocoaHashASCIIBytesLength','_cocoaCStringUsingEncodingTrampoline','_cocoaGetCStringTrampoline','kCFStringEncodingASCII','kCFStringEncodingUTF8','_unsafeAddressOfCocoaStringClass','_bridgeTaggedIntoUTF8','_cocoaUTF8Pointer','_getCocoaStringPointer','_bridgeCocoaString','_getDescription','_stringCompareExpecting','_stringCompareWithSmolCheckExpecting','_stringCompareInternalExpecting','_stringCompareExpecting','_stringCompareInternalExpecting','_stringCompareFastUTF8ExpectingBothNFC','_stringCompareFastUTF8AbnormalExpecting','_stringCompareSlowExpecting','_stringCompareSlowExpecting','_stringCompareSlowExpecting','_findDiffIdx','_lexicographicalCompareExpecting','_findBoundaryBefore','_binaryCompare','_allASCII','_persistCString','_tryNormalizeInto','_tryNormalizeInto','_cocoaASCIIEncoding','_cocoaUTF8Encoding','_isNSString','CountAndFlags','determineCodeUnitCapacity','_findStringSwitchCaseCasesString','_StringSwitchCache','_findStringSwitchCaseWithCacheCasesStringCache','_createStringTableCache','_isUTF8MultiByteLeading','_isNotOverlong_F0','_isNotOverlong_F4','_isNotOverlong_E0','_isNotOverlong_ED','_isASCII_cmp','validateUTF8','repairUTF8FirstKnownBrokenRange','_isValidArrayIndexCount','_isValidArraySubscriptCount','_destroyTLSCounter','_loadDestroyTLSCounter','_destroyTLS','_createThreadLocalStorage','_leadingSurrogateBias','_trailingSurrogateBias','_surrogateMask','_isTrailingSurrogate','_isLeadingSurrogate','_isSurrogate','_isASCII','_decodeUTF8','_decodeUTF8','_decodeUTF8','_decodeUTF8','_decodeScalarStartingAt','_decodeScalarEndingAt','_utf8ScalarLength','_utf8ScalarLengthEndingAt','_isContinuation','_continuationPayload','_decodeSurrogatePairLeadingTrailing','_numUTF8CodeUnits','_numUTF16CodeUnits','_scalarAlign','withUnsafeMutableBytesOf','withUnsafeBytesOf','withUnsafeBytesOf','transcodeFromToStoppingOnErrorInto','transcodeStopOnError','_CR','_LF','_hasGraphemeBreakBetween','_measureCharacterStrideICUOfStartingAt','_measureCharacterStrideICUOfStartingAt','_measureCharacterStrideICUOfEndingAt','_measureCharacterStrideICUOfEndingAt','_writeBackMutableSliceBoundsSlice','BidirectionalIndexable','IndexableBase','Indexable','MutableIndexable','RandomAccessIndexable','RangeReplaceableIndexable','EnumeratedIterator','IteratorOverOne','EmptyIterator','LazyFilterIterator','LazyFilterIndex','LazyDropWhileIterator','LazyDropWhileIndex','LazyDropWhileBidirectionalCollection','LazyFilterBidirectionalCollection','LazyMapIterator','LazyMapBidirectionalCollection','LazyMapRandomAccessCollection','LazyBidirectionalCollection','LazyRandomAccessCollection','FlattenCollectionIndex','FlattenBidirectionalCollectionIndex','FlattenBidirectionalCollection','JoinedIterator','Zip2Iterator','LazyPrefixWhileIterator','LazyPrefixWhileIndex','LazyPrefixWhileBidirectionalCollection','ReversedRandomAccessCollection','ReversedIndex','BidirectionalSlice','RandomAccessSlice','RangeReplaceableSlice','RangeReplaceableBidirectionalSlice','RangeReplaceableRandomAccessSlice','MutableSlice','MutableBidirectionalSlice','MutableRandomAccessSlice','MutableRangeReplaceableSlice','MutableRangeReplaceableBidirectionalSlice','MutableRangeReplaceableRandomAccessSlice','DefaultBidirectionalIndices','DefaultRandomAccessIndices','NilLiteralConvertible','_BuiltinIntegerLiteralConvertible','IntegerLiteralConvertible','_BuiltinFloatLiteralConvertible','FloatLiteralConvertible','_BuiltinBooleanLiteralConvertible','BooleanLiteralConvertible','_BuiltinUnicodeScalarLiteralConvertible','UnicodeScalarLiteralConvertible','_BuiltinExtendedGraphemeClusterLiteralConvertible','ExtendedGraphemeClusterLiteralConvertible','_BuiltinStringLiteralConvertible','StringLiteralConvertible','ArrayLiteralConvertible','DictionaryLiteralConvertible','StringInterpolationConvertible','_ColorLiteralConvertible','_ImageLiteralConvertible','_FileReferenceLiteralConvertible','ClosedRangeIndex','ImplicitlyUnwrappedOptional','DictionaryLiteral','UTF8','UTF16','UTF32','UnicodeScalar','UnsafeBufferPointerIterator','UnsafeRawBufferPointerIterator','UnsafeMutableRawBufferPointerIterator','PlaygroundQuickLook','CustomPlaygroundQuickLookable','_DefaultCustomPlaygroundQuickLookable','_stdlib_isOSVersionAtLeast','_abstractFileLine','infix_61_61','infix_33_61','infix_60','infix_60_61','infix_62','infix_62_61','infix_61_61','infix_33_61','infix_60','infix_60_61','infix_62','infix_62_61','infix_61_61','infix_33_61','infix_60','infix_60_61','infix_62','infix_62_61','infix_61_61','infix_33_61','infix_60','infix_60_61','infix_62','infix_62_61','infix_61_61','infix_33_61','infix_60','infix_60_61','infix_62','infix_62_61','infix_61_61','infix_33_61','infix_60','infix_60_61','infix_62','infix_62_61','sequenceFirstNext','sequenceStateNext','UnfoldFirstSequence','_countGPRegisters','_countFPRegisters','_fpRegisterWords','_registerSaveWords','_VAUInt','_VAInt','withVaList','_withVaList','getVaList','_encodeBitsAsWords','zip','_ArrayBody','_DependenceToken','_stdlib_AtomicInt','_ObjectiveCBridgeable','_BridgeableMetatype','_CocoaFastEnumerationStackBuf','_BridgeStorage','_BridgingBufferHeader','Encodable','Decodable','Encoder','Decoder','KeyedEncodingContainerProtocol','KeyedEncodingContainer','KeyedDecodingContainerProtocol','KeyedDecodingContainer','UnkeyedEncodingContainer','UnkeyedDecodingContainer','SingleValueEncodingContainer','SingleValueDecodingContainer','_KeyedEncodingContainerBase','_KeyedEncodingContainerBox','_KeyedDecodingContainerBase','_KeyedDecodingContainerBox','RawRepresentable','CaseIterable','ExpressibleByNilLiteral','_ExpressibleByBuiltinIntegerLiteral','ExpressibleByIntegerLiteral','_ExpressibleByBuiltinFloatLiteral','ExpressibleByFloatLiteral','_ExpressibleByBuiltinBooleanLiteral','ExpressibleByBooleanLiteral','_ExpressibleByBuiltinUnicodeScalarLiteral','ExpressibleByUnicodeScalarLiteral','_ExpressibleByBuiltinExtendedGraphemeClusterLiteral','ExpressibleByExtendedGraphemeClusterLiteral','_ExpressibleByBuiltinStringLiteral','ExpressibleByStringLiteral','ExpressibleByArrayLiteral','ExpressibleByDictionaryLiteral','ExpressibleByStringInterpolation','StringInterpolationProtocol','_ExpressibleByColorLiteral','_ExpressibleByImageLiteral','_ExpressibleByFileReferenceLiteral','_DestructorSafeContainer','_HasContiguousBytes','_UnsafePartiallyInitializedContiguousArrayBuffer','_DebuggerSupport','_DictionaryBuilder','_DictionaryBuffer','Equatable','Error','FloatingPointClassification','FloatingPointRoundingRule','Hashable','_HasCustomAnyHashableRepresentation','_AnyHashableBox','_ConcreteHashableBox','Hasher','_UnmanagedAnyObjectArray','_HashTableDelegate','AdditiveArithmetic','Numeric','SignedNumeric','_IntegerAnyHashableBox','KeyPathKind','KeyPathComponentKind','ComputedPropertyID','ComputedArgumentWitnesses','KeyPathComponent','ClassHolder','MutatingWritebackBuffer','NonmutatingWritebackBuffer','KeyPathComputedIDKind','RawKeyPathComponent','KeyPathBuffer','_AppendKeyPath','KeyPathStructOrClass','KeyPathPatternStoredOffset','KeyPathPatternComputedArguments','KeyPathPatternVisitor','GetKeyPathClassAndInstanceSizeFromPattern','InstantiateKeyPathBuffer','ValidatingInstantiateKeyPathBuffer','ManagedBuffer','ManagedBufferPointer','MemoryLayout','_SwiftNewtypeWrapper','_NewtypeWrapperAnyHashableBox','_SegmentSource','_OptionalNilComparisonType','TextOutputStream','TextOutputStreamable','CustomStringConvertible','LosslessStringConvertible','CustomDebugStringConvertible','_Stdout','_TeeStream','RandomNumberGenerator','SystemRandomNumberGenerator','RangeExpression','PartialRangeUpTo','PartialRangeThrough','UnboundedRange_','Result','_Buffer32','_Buffer72','__SwiftNativeNSArray','__SwiftNativeNSDictionary','__SwiftNativeNSSet','__SwiftNativeNSEnumerator','__SwiftNativeNSData','__stdlib_ReturnAutoreleasedDummy','_RuntimeFunctionCounters','_RuntimeFunctionCountersStats','_RuntimeFunctionCountersState','_GlobalRuntimeFunctionCountersState','_ObjectRuntimeFunctionCountersState','IteratorProtocol','Sequence','DropFirstSequence','PrefixSequence','DropWhileSequence','IteratorSequence','_SetAnyHashableBox','SetAlgebra','_SetBuilder','_RawSetStorage','_SetBuffer','_ShadowProtocol','_NSFastEnumeration','_NSEnumerator','_NSCopying','_NSArrayCore','_NSDictionaryCore','_NSDictionary','_NSSetCore','_NSSet','_NSNumber','_SmallBuffer','StrideToIterator','StrideThroughIterator','_StringBreadcrumbs','_KnownCocoaString','CocoaStringPointer','__SwiftNativeNSString','_StringComparisonResult','_StringGuts','_StringGutsSlice','_StringObject','DefaultStringInterpolation','_Normalization','_AbstractStringStorage','_StringStorage','_SharedStringStorage','_OpaqueStringSwitchCache','_StringSwitchContext','_StringRepresentation','UTF8ExtraInfo','UTF8ValidationResult','UTF8ValidationError','__SwiftNativeNSArrayWithContiguousStorage','__SwiftDeferredNSArray','__ContiguousArrayStorageBase','_TLSAtomicInt','_ThreadLocalStorage','_UnicodeEncoding','_UnicodeParser','Unmanaged','_UTFParser','UnicodeDecodingResult','UnicodeCodec','_StringElement','Unicode','_PlaygroundQuickLook','_CustomPlaygroundQuickLookable','__DefaultCustomPlaygroundQuickLookable','AnyIterator','_ClosureBasedIterator','_AnyIteratorBoxBase','_IteratorBox','_AnySequenceBox','_AnyCollectionBox','_AnyBidirectionalCollectionBox','_AnyRandomAccessCollectionBox','_SequenceBox','_CollectionBox','_BidirectionalCollectionBox','_RandomAccessCollectionBox','_ClosureBasedSequence','AnySequence','_AnyIndexBox','_IndexBox','CustomReflectable','CustomLeafReflectable','MirrorPath','CustomPlaygroundDisplayConvertible','CommandLine','SIMDStorage','SIMDScalar','SIMD','SIMDMask','SIMD2','SIMD4','SIMD8','SIMD16','SIMD32','SIMD64','SIMD3','UnfoldSequence','CVarArg','_CVarArgPassedAsDouble','_CVarArgAligned','__VaListBuilder','Zip2Sequence','EnumeratedSequence','_ArrayAnyHashableProtocol','_ArrayAnyHashableBox','_UnsafeBitset','Bool','_BridgingBufferStorage','CodingKey','CodingUserInfoKey','EncodingError','DecodingError','_GenericIndexKey','_DictionaryCodingKey','IndexingIterator','Collection','Comparable','__EmptyArrayStorage','_ContiguousArrayStorage','OpaquePointer','CVaListPointer','Dictionary','_DictionaryAnyHashableBox','_MergeError','_SwiftDictionaryNSEnumerator','_SwiftDeferredNSDictionary','_CocoaDictionary','_RawDictionaryStorage','_EmptyDictionarySingleton','_DictionaryStorage','_FloatAnyHashableBox','_DoubleAnyHashableBox','_Float80AnyHashableBox','AnyHashable','_SwiftEmptyNSEnumerator','_BridgingHashBuffer','_HashTable','JoinedSequence','AnyKeyPath','PartialKeyPath','KeyPath','WritableKeyPath','ReferenceWritableKeyPath','LazySequenceProtocol','MutableCollection','_NativeDictionary','_NativeSet','_NormalizedUTF8CodeUnitIterator','_NormalizedUTF16CodeUnitIterator','_NormalizedUTF8CodeUnitIterator_2','ObjectIdentifier','Optional','OptionSet','Never','PartialRangeFrom','RangeReplaceableCollection','Set','_SwiftSetNSEnumerator','_SwiftDeferredNSSet','_CocoaSet','_EmptySetSingleton','_SetStorage','StaticString','Strideable','StrideTo','StrideThrough','AnyIndex','_AnyCollectionProtocol','AnyCollection','Mirror','_ArrayProtocol','BidirectionalCollection','Character','FlattenSequence','FloatingPoint','BinaryFloatingPoint','Float','Double','Float80','BinaryInteger','FixedWidthInteger','UnsignedInteger','SignedInteger','UInt8','Int8','UInt16','Int16','UInt32','Int32','UInt64','Int64','UInt','Int','LazyCollectionProtocol','_Pointer','LazyPrefixWhileSequence','RandomAccessCollection','Range','Repeated','ReversedCollection','Slice','_SmallString','StringProtocol','Substring','_UIntBuffer','UnsafeMutableBufferPointer','UnsafeBufferPointer','UnsafeMutableRawBufferPointer','UnsafeRawBufferPointer','UnsafePointer','UnsafeMutablePointer','UnsafeRawPointer','UnsafeMutableRawPointer','_ValidUTF8Buffer','CollectionOfOne','AnyBidirectionalCollection','AnyRandomAccessCollection','_ArrayBufferProtocol','Array','ArraySlice','AutoreleasingUnsafeMutablePointer','_CocoaArrayWrapper','ContiguousArray','ClosedRange','_ContiguousArrayBuffer','LazyDropWhileSequence','EmptyCollection','LazyFilterSequence','_FixedArray2','_FixedArray4','_FixedArray8','_FixedArray16','FloatingPointSign','DefaultIndices','KeyValuePairs','LazySequence','LazyMapSequence','String','_SliceBuffer','_ArrayBuffer']
const includeFilePaths = [...includeDefinitions.map(file => `${root}include/foundation/${file}.ts`), ...fs.readdirSync(`${root}include/util`).map(file => `${root}include/util/${file}`)]
const includes = includeFilePaths.map(file => fs.readFileSync(file)).join('\n')

//console.log(includes);
//throw 'only logging'

const todo = ['ambiguous-binary.swift', 'ambiguous-binary-native-literal.swift']

const testDirNames = fs.readdirSync(__dirname).filter(dir => !(dir === 'node_modules' || dir === '.' || dir === '..' || dir === '.idea' || !fs.statSync(`${__dirname}/${dir}`).isDirectory()))
const testDirs = testDirNames.map(dirName => ({
    dirName,
    fileNames: fs.readdirSync(`${__dirname}/${dirName}`).filter(fileName => !todo.includes(fileName))
}))

function transpile(dirName, fileName) {
    return execSync(`/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O ${root}test/${dirName}/${fileName}`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
}

function executeTranspiled(code) {
    fs.writeFileSync(`${root}test/test.ts`, transpiledCode);
    return execSync(`ts-node --disableWarnings ${root}test/test.ts`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
}

function executeOriginal(dirName, fileName) {
    return execSync(`swift ${__dirname}/${dirName}/${fileName}`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
}

let transpiledCode = includes
console.time('c++')
testDirs.forEach(({dirName, fileNames}) => {
    fileNames.forEach(fileName => {
        const transpiled = transpile(dirName, fileName)
        transpiledCode += '\n;try{(function(){\n' + transpiled + '\n})()}catch(e){console.log(e)}\nconsole.log("$$$")'
    })
})
console.timeEnd('c++')

console.time('ts')
const transpileLog = executeTranspiled(transpiledCode)
console.timeEnd('ts')
let transpileI = 0

testDirs.forEach(({dirName, fileNames}) => {
    describe(dirName, () => {
        fileNames.forEach(fileName => {
            it(fileName.replace('.swift', ''), () => {

                let expectedLog = executeOriginal(dirName, fileName)

                let transpileINew = transpileLog.indexOf('$$$', transpileI)
                let transpileChunk = transpileLog.substring(transpileI, transpileINew)
                transpileI = transpileINew + '$$$\n'.length

                //console.log(expectedLog);
                //console.log('>>>>>>>>');
                //console.log(transpileChunk);

                assert(expectedLog.length > 1);
                assert(transpileChunk.length > 1);
                var tsLines = transpileChunk.split('\n'), swiftLines = expectedLog.split('\n');
                assert(tsLines.length > 1);
                assert(swiftLines.length > 1);
                assert.equal(tsLines.length, swiftLines.length);
                for(var i = 0; i < swiftLines.length; i++) {
                    if(swiftLines[i] === 'nil') assert(tsLines[i] === 'null' || tsLines[i] === 'undefined');
                    else assert.equal(tsLines[i], swiftLines[i]);
                }
            });
        });
    });
});
